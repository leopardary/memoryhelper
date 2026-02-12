import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';
import { connectDB } from '../src/lib/db/utils';
import MemoryPiece from '../src/lib/db/model/MemoryPiece';

dotenv.config({ path: '.env.local' });
dotenv.config();

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

interface FlattenResult {
  success: boolean;
  totalFiles: number;
  rootFiles: number;
  movedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  deletedFiles: number;
  updatedDocuments: number;
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
  // URL encode the source key for the copy operation
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

async function fileExists(key: string): Promise<boolean> {
  try {
    await s3.headObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise();
    return true;
  } catch (error) {
    return false;
  }
}

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function isInRootFolder(key: string): boolean {
  // Check if file is directly in Home/ folder (no subdirectories)
  const pathAfterHome = key.replace('Home/', '');
  return !pathAfterHome.includes('/');
}

async function flattenHomeFolder(): Promise<FlattenResult> {
  const result: FlattenResult = {
    success: true,
    totalFiles: 0,
    rootFiles: 0,
    movedFiles: 0,
    skippedFiles: 0,
    failedFiles: 0,
    deletedFiles: 0,
    updatedDocuments: 0,
    errors: [],
  };

  try {
    console.log('Fetching all files from Home/ folder...');
    const homeFiles = await listAllFilesInFolder('Home/');
    result.totalFiles = homeFiles.length;
    console.log(`Found ${result.totalFiles} files in Home/ folder\n`);

    // Track which files are already in root to avoid collisions
    const rootFiles = new Set<string>();

    // First pass: identify all files already in root
    for (const fileKey of homeFiles) {
      if (isInRootFolder(fileKey)) {
        result.rootFiles++;
        const fileName = getFileName(fileKey);
        rootFiles.add(fileName);
      }
    }

    console.log(`Files already in Home/ root: ${result.rootFiles}`);
    console.log(`Files in subdirectories: ${result.totalFiles - result.rootFiles}\n`);

    // Second pass: move files from subdirectories to root
    for (const sourceKey of homeFiles) {
      // Skip if already in root
      if (isInRootFolder(sourceKey)) {
        continue;
      }

      const fileName = getFileName(sourceKey);
      const destKey = `Home/${fileName}`;

      console.log(`Processing: ${sourceKey}`);

      // Check for filename collision
      if (rootFiles.has(fileName)) {
        console.log(`  ⏭️  Skipped (filename exists in root): ${fileName}`);
        result.skippedFiles++;

        // Delete the file in subdirectory since root has the same filename
        try {
          await deleteFile(sourceKey);
          console.log(`  🗑️  Deleted subdirectory duplicate: ${sourceKey}`);
          result.deletedFiles++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`  ❌ Failed to delete: ${errorMessage}`);
        }
        continue;
      }

      try {
        // Copy file to root
        await copyFile(sourceKey, destKey);
        console.log(`  ✅ Copied to: ${destKey}`);

        // Delete original file
        await deleteFile(sourceKey);
        console.log(`  🗑️  Deleted original: ${sourceKey}`);

        result.movedFiles++;
        result.deletedFiles++;
        rootFiles.add(fileName);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ❌ Failed to move: ${errorMessage}`);
        result.errors.push({
          file: sourceKey,
          error: errorMessage,
        });
        result.failedFiles++;
      }
    }

    return result;
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      file: 'N/A',
      error: `Flattening failed: ${errorMessage}`,
    });
    return result;
  }
}

async function updateDatabaseUrls(): Promise<number> {
  console.log('\n\nUpdating database URLs to point to Home/ root...');

  await connectDB();
  console.log('Connected to MongoDB');

  const memoryPieces = await MemoryPiece.find({
    imageUrls: { $exists: true, $ne: [] }
  }).lean();

  let updatedCount = 0;

  for (const piece of memoryPieces) {
    if (!piece.imageUrls || piece.imageUrls.length === 0) continue;

    let needsUpdate = false;
    const updatedImageUrls = piece.imageUrls.map(url => {
      // Check if URL points to Home/ subdirectories
      if (url.includes('/Home/') && url.split('/Home/')[1].includes('/')) {
        needsUpdate = true;
        // Extract filename and create new URL pointing to Home/ root
        const fileName = getFileName(url);
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/Home/${fileName}`;
      }
      return url;
    });

    if (needsUpdate) {
      await MemoryPiece.findByIdAndUpdate(piece._id, {
        imageUrls: updatedImageUrls,
      });
      console.log(`  💾 Updated MemoryPiece ${piece._id}`);
      updatedCount++;
    }
  }

  return updatedCount;
}

async function main() {
  console.log('🚀 Flattening Home/ folder structure...\n');
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

  // Step 1: Flatten S3 folder structure
  const s3Result = await flattenHomeFolder();

  console.log('\n' + '='.repeat(60));
  console.log('📊 S3 Flattening Summary:');
  console.log('='.repeat(60));
  console.log(`Total files in Home/: ${s3Result.totalFiles}`);
  console.log(`Already in root: ${s3Result.rootFiles}`);
  console.log(`✅ Successfully moved: ${s3Result.movedFiles}`);
  console.log(`⏭️  Skipped (collisions): ${s3Result.skippedFiles}`);
  console.log(`❌ Failed to move: ${s3Result.failedFiles}`);
  console.log(`🗑️  Files deleted: ${s3Result.deletedFiles}`);

  if (s3Result.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    s3Result.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.file}`);
      console.log(`     Error: ${err.error}`);
    });
    if (s3Result.errors.length > 10) {
      console.log(`  ... and ${s3Result.errors.length - 10} more errors`);
    }
  }

  // Step 2: Update database URLs
  let dbUpdatedCount = 0;
  try {
    dbUpdatedCount = await updateDatabaseUrls();
  } catch (error) {
    console.error('\n❌ Database update failed:');
    console.error(error);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Database Update Summary:');
  console.log('='.repeat(60));
  console.log(`💾 MemoryPieces updated: ${dbUpdatedCount}`);

  if (s3Result.failedFiles === 0 && s3Result.errors.length === 0) {
    console.log('\n✅ Flattening completed successfully!');
    console.log('All files are now in Home/ root directory.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Flattening completed with some errors');
    console.log(`Successfully moved ${s3Result.movedFiles} files`);
    console.log(`${s3Result.failedFiles} files failed to move (likely due to character encoding)`);
    process.exit(s3Result.failedFiles > 0 ? 1 : 0);
  }
}

main();
