import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import {connectDB} from '../src/lib/db/utils';
import MemoryPiece from '../src/lib/db/model/MemoryPiece';

dotenv.config({ path: '.env.local' });
dotenv.config();

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

interface MigrationResult {
  success: boolean;
  totalPieces: number;
  totalImages: number;
  migratedImages: number;
  failedImages: number;
  errors: Array<{ image: string; error: string }>;
}

async function uploadToS3(localPath: string, s3Key: string): Promise<string> {
  const fileContent = fs.readFileSync(localPath);
  const fileExt = path.extname(localPath).toLowerCase();

  const contentTypeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  const contentType = contentTypeMap[fileExt] || 'application/octet-stream';

  await s3.putObject({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  }).promise();

  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  return publicUrl;
}

function isLocalPublicImage(url: string): boolean {
  return url.includes('public/images') || url.startsWith('/images');
}

function getLocalFilePath(url: string): string {
  if (url.startsWith('/images')) {
    return path.join(process.cwd(), 'public', url);
  }

  if (url.includes('public/images')) {
    const publicIndex = url.indexOf('public/images');
    const relativePath = url.substring(publicIndex + 7);
    return path.join(process.cwd(), 'public', relativePath);
  }

  return url;
}

function generateS3Key(localPath: string): string {
  const fileName = path.basename(localPath);
  return `Home/${fileName}`;
}

async function migrateImagesToS3(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    totalPieces: 0,
    totalImages: 0,
    migratedImages: 0,
    failedImages: 0,
    errors: [],
  };

  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const memoryPieces = await MemoryPiece.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    result.totalPieces = memoryPieces.length;
    console.log(`Found ${result.totalPieces} memory pieces with images`);

    for (const piece of memoryPieces) {
      if (!piece.imageUrls || piece.imageUrls.length === 0) continue;

      const updatedImageUrls: string[] = [];
      let pieceModified = false;

      for (const imageUrl of piece.imageUrls) {
        result.totalImages++;

        if (isLocalPublicImage(imageUrl)) {
          console.log(`\nMigrating: ${imageUrl}`);

          try {
            const localPath = getLocalFilePath(imageUrl);

            if (!fs.existsSync(localPath)) {
              console.warn(`  ⚠️  File not found: ${localPath}`);
              result.errors.push({
                image: imageUrl,
                error: 'File not found on disk',
              });
              result.failedImages++;
              updatedImageUrls.push(imageUrl);
              continue;
            }

            const s3Key = generateS3Key(localPath);
            const s3Url = await uploadToS3(localPath, s3Key);

            console.log(`  ✅ Uploaded to: ${s3Url}`);
            updatedImageUrls.push(s3Url);
            result.migratedImages++;
            pieceModified = true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`  ❌ Failed to migrate: ${errorMessage}`);
            result.errors.push({
              image: imageUrl,
              error: errorMessage,
            });
            result.failedImages++;
            updatedImageUrls.push(imageUrl);
          }
        } else {
          updatedImageUrls.push(imageUrl);
        }
      }

      if (pieceModified) {
        await MemoryPiece.findByIdAndUpdate(piece._id, {
          imageUrls: updatedImageUrls,
        });
        console.log(`  💾 Updated MemoryPiece ${piece._id}`);
      }
    }

    result.success = result.failedImages === 0;
    return result;
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      image: 'N/A',
      error: `Migration failed: ${errorMessage}`,
    });
    return result;
  }
}

async function main() {
  console.log('🚀 Starting image migration to S3...\n');
  console.log('Environment check:');
  console.log(`  S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? '✓' : '✗'}\n`);

  if (!process.env.S3_BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('  - S3_BUCKET_NAME');
    console.error('  - AWS_REGION');
    console.error('  - AWS_ACCESS_KEY_ID');
    console.error('  - AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  const result = await migrateImagesToS3();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(60));
  console.log(`Total MemoryPieces scanned: ${result.totalPieces}`);
  console.log(`Total images found: ${result.totalImages}`);
  console.log(`✅ Successfully migrated: ${result.migratedImages}`);
  console.log(`❌ Failed migrations: ${result.failedImages}`);

  if (result.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    result.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.image}`);
      console.log(`     Error: ${err.error}`);
    });
  }

  if (result.success) {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration completed with errors');
    process.exit(1);
  }
}

main();
