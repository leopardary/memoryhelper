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

interface MoveResult {
  success: boolean;
  filesInMemoryPieces: number;
  movedFiles: number;
  failedFiles: number;
  updatedDocuments: number;
  folderDeleted: boolean;
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

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

async function moveMemoryPiecesToHome(): Promise<MoveResult> {
  const result: MoveResult = {
    success: true,
    filesInMemoryPieces: 0,
    movedFiles: 0,
    failedFiles: 0,
    updatedDocuments: 0,
    folderDeleted: false,
    errors: [],
  };

  try {
    console.log('Checking memoryPieces/ folder...');
    const memoryPiecesFiles = await listAllFilesInFolder('memoryPieces/');
    result.filesInMemoryPieces = memoryPiecesFiles.length;

    if (memoryPiecesFiles.length === 0) {
      console.log('No files found in memoryPieces/ folder');
      return result;
    }

    console.log(`Found ${result.filesInMemoryPieces} files in memoryPieces/ folder\n`);

    // Move each file from memoryPieces/ to Home/
    for (const sourceKey of memoryPiecesFiles) {
      const fileName = getFileName(sourceKey);
      const destKey = `Home/${fileName}`;

      console.log(`Moving: ${sourceKey} -> ${destKey}`);

      try {
        // Copy file to Home/
        await copyFile(sourceKey, destKey);
        console.log(`  ✅ Copied to: ${destKey}`);

        // Delete original file
        await deleteFile(sourceKey);
        console.log(`  🗑️  Deleted original: ${sourceKey}`);

        result.movedFiles++;
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
      error: `Move operation failed: ${errorMessage}`,
    });
    return result;
  }
}

async function updateDatabaseUrls(): Promise<number> {
  console.log('\n\nUpdating database URLs from memoryPieces/ to Home/...');

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
      // Check if URL points to memoryPieces/ folder
      if (url.includes('/memoryPieces/')) {
        needsUpdate = true;
        // Extract filename and create new URL pointing to Home/
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

async function deleteMemoryPiecesFolder(): Promise<boolean> {
  console.log('\n\nChecking if memoryPieces/ folder is empty...');

  const remainingFiles = await listAllFilesInFolder('memoryPieces/');

  if (remainingFiles.length > 0) {
    console.log(`⚠️  memoryPieces/ folder still has ${remainingFiles.length} files. Not deleting.`);
    return false;
  }

  console.log('✅ memoryPieces/ folder is empty (no action needed - S3 folders are virtual)');
  return true;
}

async function main() {
  console.log('🚀 Moving images from memoryPieces/ to Home/...\n');
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

  // Step 1: Move files from memoryPieces/ to Home/
  const moveResult = await moveMemoryPiecesToHome();

  console.log('\n' + '='.repeat(60));
  console.log('📊 S3 Move Summary:');
  console.log('='.repeat(60));
  console.log(`Files found in memoryPieces/: ${moveResult.filesInMemoryPieces}`);
  console.log(`✅ Successfully moved: ${moveResult.movedFiles}`);
  console.log(`❌ Failed to move: ${moveResult.failedFiles}`);

  if (moveResult.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    moveResult.errors.forEach((err, idx) => {
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

  // Step 3: Verify folder is empty
  const folderDeleted = await deleteMemoryPiecesFolder();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Summary:');
  console.log('='.repeat(60));
  console.log(`Files moved from memoryPieces/ to Home/: ${moveResult.movedFiles}`);
  console.log(`Database records updated: ${dbUpdatedCount}`);
  console.log(`memoryPieces/ folder empty: ${folderDeleted ? 'Yes' : 'No'}`);

  if (moveResult.failedFiles === 0 && moveResult.errors.length === 0) {
    console.log('\n✅ Operation completed successfully!');
    console.log('All images are now in Home/ folder.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Operation completed with some errors');
    process.exit(1);
  }
}

main();
