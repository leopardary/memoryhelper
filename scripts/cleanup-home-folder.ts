import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';
import { connectDB } from '../src/lib/db/utils';
import MemoryPiece from '../src/lib/db/model/MemoryPiece';
import Unit from '../src/lib/db/model/Unit';

dotenv.config({ path: '.env.local' });
dotenv.config();

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

interface CleanupResult {
  totalFilesInHome: number;
  filesUsedByMemoryPieces: number;
  filesUsedByUnits: number;
  movedToUnits: number;
  orphanedFiles: string[];
  updatedUnits: number;
  errors: Array<{ file: string; error: string }>;
}

async function listAllFilesInFolder(prefix: string): Promise<string[]> {
  const files: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }).promise();

    if (response.Contents) {
      files.push(...response.Contents.map(obj => obj.Key!).filter(key => !key.endsWith('/')));
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return files;
}

async function copyFile(sourceKey: string, destKey: string): Promise<void> {
  const encodedSourceKey = encodeURIComponent(sourceKey);
  await s3.copyObject({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${encodedSourceKey}`,
    Key: destKey,
    ACL: 'public-read',
  }).promise();
}

async function deleteFile(key: string): Promise<void> {
  await s3.deleteObject({
    Bucket: BUCKET_NAME,
    Key: key,
  }).promise();
}

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return getFileName(pathname);
  } catch {
    return getFileName(url);
  }
}

async function cleanupHomeFolder(): Promise<CleanupResult> {
  const result: CleanupResult = {
    totalFilesInHome: 0,
    filesUsedByMemoryPieces: 0,
    filesUsedByUnits: 0,
    movedToUnits: 0,
    orphanedFiles: [],
    updatedUnits: 0,
    errors: [],
  };

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('Fetching all files from Home/ folder...');
    const homeFiles = await listAllFilesInFolder('Home/');
    result.totalFilesInHome = homeFiles.length;
    console.log(`Found ${result.totalFilesInHome} files in Home/ folder\n`);

    // Create a set of filenames for quick lookup
    const homeFileNames = new Set(homeFiles.map(getFileName));

    // Check which files are used by MemoryPieces
    console.log('Checking MemoryPiece usage...');
    const memoryPieces = await MemoryPiece.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    const filesUsedByMemoryPieces = new Set<string>();
    for (const piece of memoryPieces) {
      if (piece.imageUrls && piece.imageUrls.length > 0) {
        for (const url of piece.imageUrls) {
          if (url.includes('/Home/')) {
            const fileName = getFileNameFromUrl(url);
            if (homeFileNames.has(fileName)) {
              filesUsedByMemoryPieces.add(fileName);
            }
          }
        }
      }
    }
    result.filesUsedByMemoryPieces = filesUsedByMemoryPieces.size;
    console.log(`Files used by MemoryPieces: ${result.filesUsedByMemoryPieces}\n`);

    // Check which files are used by Units
    console.log('Checking Unit usage...');
    const units = await Unit.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    const filesUsedByUnits = new Map<string, string[]>(); // fileName -> unitIds[]
    for (const unit of units) {
      if (unit.imageUrls && unit.imageUrls.length > 0) {
        for (const url of unit.imageUrls) {
          if (url.includes('/Home/')) {
            const fileName = getFileNameFromUrl(url);
            if (homeFileNames.has(fileName) && !filesUsedByMemoryPieces.has(fileName)) {
              if (!filesUsedByUnits.has(fileName)) {
                filesUsedByUnits.set(fileName, []);
              }
              filesUsedByUnits.get(fileName)!.push(unit._id.toString());
            }
          }
        }
      }
    }
    result.filesUsedByUnits = filesUsedByUnits.size;
    console.log(`Files used by Units (not MemoryPieces): ${result.filesUsedByUnits}\n`);

    // Move files that belong to Units
    if (filesUsedByUnits.size > 0) {
      console.log('Moving Unit-associated files from Home/ to units/...\n');

      for (const [fileName, unitIds] of filesUsedByUnits.entries()) {
        const sourceKey = `Home/${fileName}`;
        const destKey = `units/${fileName}`;

        console.log(`Moving: ${sourceKey} -> ${destKey}`);
        console.log(`  Used by ${unitIds.length} unit(s): ${unitIds.slice(0, 3).join(', ')}${unitIds.length > 3 ? '...' : ''}`);

        try {
          // Copy file to units/
          await copyFile(sourceKey, destKey);
          console.log(`  ✅ Copied to: ${destKey}`);

          // Delete original file from Home/
          await deleteFile(sourceKey);
          console.log(`  🗑️  Deleted original: ${sourceKey}`);

          result.movedToUnits++;

          // Update database URLs for affected Units
          const newUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/units/${fileName}`;
          const oldUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/Home/${fileName}`;

          for (const unitId of unitIds) {
            const unit = await Unit.findById(unitId);
            if (unit && unit.imageUrls) {
              const updatedUrls = unit.imageUrls.map(url =>
                url === oldUrl ? newUrl : url
              );
              await Unit.findByIdAndUpdate(unitId, { imageUrls: updatedUrls });
              console.log(`  💾 Updated Unit ${unitId}`);
              result.updatedUnits++;
            }
          }

          console.log('');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`  ❌ Failed to move: ${errorMessage}\n`);
          result.errors.push({
            file: sourceKey,
            error: errorMessage,
          });
        }
      }
    }

    // Identify orphaned files
    console.log('\nChecking for orphaned files...');
    for (const fileKey of homeFiles) {
      const fileName = getFileName(fileKey);
      if (!filesUsedByMemoryPieces.has(fileName) && !filesUsedByUnits.has(fileName)) {
        result.orphanedFiles.push(fileKey);
      }
    }

    if (result.orphanedFiles.length > 0) {
      console.log(`\n⚠️  Found ${result.orphanedFiles.length} orphaned files in Home/ folder:`);
      result.orphanedFiles.slice(0, 20).forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file}`);
      });
      if (result.orphanedFiles.length > 20) {
        console.log(`  ... and ${result.orphanedFiles.length - 20} more`);
      }
      console.log('\nThese files are not referenced by any MemoryPiece or Unit.');
    } else {
      console.log('✅ No orphaned files found.');
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      file: 'N/A',
      error: `Cleanup failed: ${errorMessage}`,
    });
    return result;
  }
}

async function main() {
  console.log('🧹 Cleaning up Home/ folder...\n');
  console.log('Environment check:');
  console.log(`  S3 Bucket: ${BUCKET_NAME}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? '✓' : '✗'}\n`);

  if (!BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('  - S3_BUCKET_NAME');
    console.error('  - AWS_REGION');
    console.error('  - AWS_ACCESS_KEY_ID');
    console.error('  - AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  const result = await cleanupHomeFolder();

  console.log('\n' + '='.repeat(70));
  console.log('📊 Cleanup Summary:');
  console.log('='.repeat(70));
  console.log(`Total files in Home/ folder: ${result.totalFilesInHome}`);
  console.log(`Files used by MemoryPieces: ${result.filesUsedByMemoryPieces}`);
  console.log(`Files used by Units: ${result.filesUsedByUnits}`);
  console.log(`✅ Files moved to units/ folder: ${result.movedToUnits}`);
  console.log(`💾 Unit records updated: ${result.updatedUnits}`);
  console.log(`⚠️  Orphaned files: ${result.orphanedFiles.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    result.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.file}`);
      console.log(`     Error: ${err.error}`);
    });
  }

  if (result.errors.length === 0) {
    console.log('\n✅ Cleanup completed successfully!');
    if (result.movedToUnits > 0) {
      console.log(`Moved ${result.movedToUnits} Unit-associated files from Home/ to units/ folder.`);
    }
    if (result.orphanedFiles.length === 0) {
      console.log('All files in Home/ folder are properly associated with MemoryPieces.');
    }
    process.exit(0);
  } else {
    console.log('\n⚠️  Cleanup completed with errors');
    process.exit(1);
  }
}

main();
