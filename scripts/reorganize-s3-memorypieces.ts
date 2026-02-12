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

interface ReorganizationResult {
  success: boolean;
  totalFiles: number;
  movedFiles: number;
  skippedFiles: number;
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
  await s3.copyObject({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${sourceKey}`,
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

async function reorganizeS3Files(): Promise<ReorganizationResult> {
  const result: ReorganizationResult = {
    success: true,
    totalFiles: 0,
    movedFiles: 0,
    skippedFiles: 0,
    deletedFiles: 0,
    updatedDocuments: 0,
    errors: [],
  };

  try {
    console.log('Fetching all files from Home/ folder...');
    const homeFiles = await listAllFilesInFolder('Home/');
    result.totalFiles = homeFiles.length;
    console.log(`Found ${result.totalFiles} files in Home/ folder\n`);

    // Track which files we've already moved to avoid collisions
    const movedFiles = new Set<string>();

    // Process each file
    for (const sourceKey of homeFiles) {
      const fileName = getFileName(sourceKey);
      const destKey = `memoryPieces/${fileName}`;

      console.log(`Processing: ${sourceKey}`);

      // Skip if we've already moved a file with this name (collision)
      if (movedFiles.has(fileName)) {
        console.log(`  ⏭️  Skipped (filename collision): ${fileName}`);
        result.skippedFiles++;

        // Delete the duplicate file
        try {
          await deleteFile(sourceKey);
          console.log(`  🗑️  Deleted duplicate: ${sourceKey}`);
          result.deletedFiles++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`  ❌ Failed to delete duplicate: ${errorMessage}`);
        }
        continue;
      }

      try {
        // Check if destination already exists
        const destExists = await fileExists(destKey);

        if (destExists) {
          console.log(`  ⏭️  Skipped (already exists at destination): ${destKey}`);
          result.skippedFiles++;

          // Delete the source file since destination exists
          await deleteFile(sourceKey);
          console.log(`  🗑️  Deleted source: ${sourceKey}`);
          result.deletedFiles++;
        } else {
          // Copy file to new location
          await copyFile(sourceKey, destKey);
          console.log(`  ✅ Copied to: ${destKey}`);

          // Delete original file
          await deleteFile(sourceKey);
          console.log(`  🗑️  Deleted original: ${sourceKey}`);

          result.movedFiles++;
          result.deletedFiles++;
        }

        movedFiles.add(fileName);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ❌ Failed to process: ${errorMessage}`);
        result.errors.push({
          file: sourceKey,
          error: errorMessage,
        });
      }
    }

    return result;
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      file: 'N/A',
      error: `Reorganization failed: ${errorMessage}`,
    });
    return result;
  }
}

async function updateDatabaseUrls(): Promise<number> {
  console.log('\n\nUpdating database URLs...');

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
      // Check if URL points to old Home/ location
      if (url.includes('/Home/')) {
        needsUpdate = true;
        // Extract filename and create new URL
        const fileName = getFileName(url);
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/memoryPieces/${fileName}`;
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
  console.log('🚀 Starting S3 reorganization: Home/ → memoryPieces/ (flattened)...\n');
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

  // Step 1: Reorganize S3 files
  const s3Result = await reorganizeS3Files();

  console.log('\n' + '='.repeat(60));
  console.log('📊 S3 Reorganization Summary:');
  console.log('='.repeat(60));
  console.log(`Total files found: ${s3Result.totalFiles}`);
  console.log(`✅ Successfully moved: ${s3Result.movedFiles}`);
  console.log(`⏭️  Skipped (collisions): ${s3Result.skippedFiles}`);
  console.log(`🗑️  Files deleted: ${s3Result.deletedFiles}`);

  if (s3Result.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    s3Result.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.file}`);
      console.log(`     Error: ${err.error}`);
    });
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

  if (s3Result.errors.length === 0) {
    console.log('\n✅ Reorganization completed successfully!');
    console.log('\n📁 New structure:');
    console.log('  Old: Home/{subdirs}/{filename}');
    console.log('  New: memoryPieces/{filename}');
    process.exit(0);
  } else {
    console.log('\n⚠️  Reorganization completed with errors');
    process.exit(1);
  }
}

main();
