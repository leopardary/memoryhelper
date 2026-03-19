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
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

interface MigrationResult {
  totalMemoryPieces: number;
  memoryPiecesProcessed: number;
  totalImageUrls: number;
  imagesMoved: number;
  imagesAlreadyInSubfolder: number;
  imagesNotFound: number;
  memoryPiecesUpdated: number;
  errors: Array<{ memoryPieceId: string; content: string; error: string }>;
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

async function copyFile(sourceKey: string, destKey: string): Promise<void> {
  // For CopySource, we need to encode each path segment separately
  const encodedSourceKey = sourceKey
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  await s3.copyObject({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${encodedSourceKey}`,
    Key: destKey, // Key should NOT be encoded - S3 stores the actual characters
    ACL: 'public-read',
  }).promise();
}

async function deleteFile(key: string): Promise<void> {
  await s3.deleteObject({
    Bucket: BUCKET_NAME,
    Key: key,
  }).promise();
}

function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch {
    return null;
  }
}

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function isAlreadyInSubfolder(key: string, content: string): boolean {
  // Check if the key follows the pattern: Home/{content}/{filename}
  const pattern = new RegExp(`^Home/${content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^/]+$`);
  return pattern.test(key);
}

async function migrateMemoryPiecesToSubfolders(): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalMemoryPieces: 0,
    memoryPiecesProcessed: 0,
    totalImageUrls: 0,
    imagesMoved: 0,
    imagesAlreadyInSubfolder: 0,
    imagesNotFound: 0,
    memoryPiecesUpdated: 0,
    errors: [],
  };

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('Finding MemoryPieces with images...');
    const memoryPieces = await MemoryPiece.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    result.totalMemoryPieces = memoryPieces.length;
    console.log(`Found ${result.totalMemoryPieces} MemoryPieces with images\n`);

    if (memoryPieces.length === 0) {
      console.log('No MemoryPieces found with images');
      return result;
    }

    for (const memoryPiece of memoryPieces) {
      console.log(`\nProcessing MemoryPiece ${memoryPiece._id}:`);
      console.log(`  Content: "${memoryPiece.content}"`);

      if (!memoryPiece.imageUrls || memoryPiece.imageUrls.length === 0) continue;

      result.memoryPiecesProcessed++;
      let needsUpdate = false;
      const updatedImageUrls: string[] = [];

      for (const url of memoryPiece.imageUrls) {
        result.totalImageUrls++;

        const currentKey = extractS3KeyFromUrl(url);
        if (!currentKey) {
          console.log(`  ⚠️  Invalid URL format: ${url}`);
          result.errors.push({
            memoryPieceId: memoryPiece._id.toString(),
            content: memoryPiece.content,
            error: `Invalid URL format: ${url}`
          });
          updatedImageUrls.push(url);
          continue;
        }

        // Check if already in content subfolder
        if (isAlreadyInSubfolder(currentKey, memoryPiece.content)) {
          console.log(`  ✅ Already in subfolder: ${currentKey}`);
          result.imagesAlreadyInSubfolder++;
          updatedImageUrls.push(url);
          continue;
        }

        // Get filename and construct new key
        // Use decoded filename for the new location
        const fileName = getFileName(currentKey);
        const decodedFileName = decodeURIComponent(fileName);
        const newKey = `Home/${memoryPiece.content}/${decodedFileName}`;
        const newUrl = `${S3_BASE_URL}/${newKey}`;

        console.log(`  Processing: ${fileName}`);
        console.log(`    Current key: ${currentKey}`);
        console.log(`    New key: ${newKey}`);

        try {
          // Check if source file exists (try both encoded and decoded versions)
          let actualSourceKey = currentKey;
          let sourceExists = await fileExists(currentKey);

          if (!sourceExists) {
            // Try with decoded filename
            const decodedFileName = decodeURIComponent(fileName);
            const decodedCurrentKey = currentKey.replace(fileName, decodedFileName);
            sourceExists = await fileExists(decodedCurrentKey);

            if (sourceExists) {
              console.log(`    ℹ️  Found with decoded filename: ${decodedCurrentKey}`);
              actualSourceKey = decodedCurrentKey;
            }
          }

          if (!sourceExists) {
            console.log(`    ❌ Source file not found: ${currentKey} (also tried decoded)`);
            result.imagesNotFound++;
            result.errors.push({
              memoryPieceId: memoryPiece._id.toString(),
              content: memoryPiece.content,
              error: `Source file not found: ${currentKey}`
            });
            updatedImageUrls.push(url);
            continue;
          }

          // Check if destination already exists
          const destExists = await fileExists(newKey);
          if (destExists) {
            console.log(`    ⏭️  Already exists at destination: ${newKey}`);
            result.imagesAlreadyInSubfolder++;
            updatedImageUrls.push(newUrl);
            needsUpdate = true;
            continue;
          }

          // Copy file to new location
          await copyFile(actualSourceKey, newKey);
          console.log(`    ✅ Copied to: ${newKey}`);

          // Delete the old file
          await deleteFile(actualSourceKey);
          console.log(`    🗑️  Deleted old file: ${actualSourceKey}`);

          result.imagesMoved++;
          updatedImageUrls.push(newUrl);
          needsUpdate = true;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`    ❌ Failed: ${errorMessage}`);
          result.errors.push({
            memoryPieceId: memoryPiece._id.toString(),
            content: memoryPiece.content,
            error: `Failed to move ${currentKey}: ${errorMessage}`
          });
          updatedImageUrls.push(url);
        }
      }

      // Update the MemoryPiece document if any URLs were changed
      if (needsUpdate) {
        await MemoryPiece.findByIdAndUpdate(memoryPiece._id, { imageUrls: updatedImageUrls });
        console.log(`  💾 Updated MemoryPiece ${memoryPiece._id}`);
        result.memoryPiecesUpdated++;
      } else {
        console.log(`  ℹ️  No changes needed for MemoryPiece ${memoryPiece._id}`);
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      memoryPieceId: 'N/A',
      content: 'N/A',
      error: `Migration failed: ${errorMessage}`
    });
    return result;
  }
}

async function main() {
  console.log('🔄 Migrating MemoryPiece images to content subfolders...\n');
  console.log('Environment check:');
  console.log(`  S3 Bucket: ${BUCKET_NAME}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? '✓' : '✗'}\n`);

  if (!BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const result = await migrateMemoryPiecesToSubfolders();

  console.log('\n' + '='.repeat(70));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(70));
  console.log(`Total MemoryPieces with images: ${result.totalMemoryPieces}`);
  console.log(`MemoryPieces processed: ${result.memoryPiecesProcessed}`);
  console.log(`Total image URLs: ${result.totalImageUrls}`);
  console.log(`✅ Images moved: ${result.imagesMoved}`);
  console.log(`✅ Images already in subfolder: ${result.imagesAlreadyInSubfolder}`);
  console.log(`❌ Images not found: ${result.imagesNotFound}`);
  console.log(`💾 MemoryPieces updated: ${result.memoryPiecesUpdated}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
    result.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. MemoryPiece: ${err.memoryPieceId} (Content: "${err.content}")`);
      console.log(`     Error: ${err.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }

  if (result.imagesNotFound === 0 && result.errors.length === 0) {
    console.log('\n✅ All MemoryPiece images migrated successfully!');
    console.log(`Moved ${result.imagesMoved} images to content-specific subfolders.`);
    console.log(`Updated ${result.memoryPiecesUpdated} MemoryPiece records.`);
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration completed with errors');
    process.exit(1);
  }
}

main();
