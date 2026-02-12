import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';
import { connectDB } from '../src/lib/db/utils';
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
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

interface DecodeResult {
  totalUnitsWithEncodedUrls: number;
  totalImageUrls: number;
  imagesRenamed: number;
  imagesAlreadyDecoded: number;
  imagesMissing: number;
  unitsUpdated: number;
  errors: Array<{ file: string; error: string }>;
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

function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

function hasEncodedCharacters(str: string): boolean {
  return /%[0-9A-F]{2}/i.test(str);
}

async function decodeUnitImageUrls(): Promise<DecodeResult> {
  const result: DecodeResult = {
    totalUnitsWithEncodedUrls: 0,
    totalImageUrls: 0,
    imagesRenamed: 0,
    imagesAlreadyDecoded: 0,
    imagesMissing: 0,
    unitsUpdated: 0,
    errors: [],
  };

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('Finding Units with encoded URLs...');
    const units = await Unit.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    const unitsWithEncodedUrls = units.filter(unit =>
      unit.imageUrls && unit.imageUrls.some(url => hasEncodedCharacters(url))
    );

    result.totalUnitsWithEncodedUrls = unitsWithEncodedUrls.length;
    console.log(`Found ${result.totalUnitsWithEncodedUrls} Units with encoded URLs\n`);

    if (unitsWithEncodedUrls.length === 0) {
      console.log('No Units found with encoded URLs');
      return result;
    }

    for (const unit of unitsWithEncodedUrls) {
      console.log(`\nProcessing Unit ${unit._id}:`);

      if (!unit.imageUrls || unit.imageUrls.length === 0) continue;

      let unitNeedsUpdate = false;
      const updatedImageUrls: string[] = [];

      for (const url of unit.imageUrls) {
        if (!hasEncodedCharacters(url)) {
          updatedImageUrls.push(url);
          continue;
        }

        result.totalImageUrls++;

        const encodedKey = extractS3KeyFromUrl(url);
        if (!encodedKey) {
          console.log(`  ⚠️  Invalid URL format: ${url}`);
          result.errors.push({ file: url, error: 'Invalid URL format' });
          updatedImageUrls.push(url);
          continue;
        }

        // Decode the path to get Chinese characters
        const decodedKey = decodeURIComponent(encodedKey);
        const decodedUrl = `${S3_BASE_URL}/${decodedKey}`;

        console.log(`  Processing: ${url}`);
        console.log(`    Encoded key: ${encodedKey}`);
        console.log(`    Decoded key: ${decodedKey}`);
        console.log(`    New URL: ${decodedUrl}`);

        try {
          // Check if file exists at encoded location
          const encodedExists = await fileExists(encodedKey);

          // Check if file already exists at decoded location
          const decodedExists = await fileExists(decodedKey);

          if (decodedExists) {
            console.log(`    ✅ File already exists at decoded location`);
            result.imagesAlreadyDecoded++;
            updatedImageUrls.push(decodedUrl);
            unitNeedsUpdate = true;

            // Delete the encoded version if it exists
            if (encodedExists && encodedKey !== decodedKey) {
              await deleteFile(encodedKey);
              console.log(`    🗑️  Deleted encoded version: ${encodedKey}`);
            }
            continue;
          }

          if (!encodedExists) {
            console.log(`    ❌ Source file not found at: ${encodedKey}`);
            result.imagesMissing++;
            result.errors.push({ file: encodedKey, error: 'Source file not found' });
            updatedImageUrls.push(url);
            continue;
          }

          // Copy file from encoded path to decoded path
          await copyFile(encodedKey, decodedKey);
          console.log(`    ✅ Copied to decoded path: ${decodedKey}`);

          // Delete the encoded version
          await deleteFile(encodedKey);
          console.log(`    🗑️  Deleted encoded version: ${encodedKey}`);

          result.imagesRenamed++;
          updatedImageUrls.push(decodedUrl);
          unitNeedsUpdate = true;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`    ❌ Failed: ${errorMessage}`);
          result.errors.push({ file: encodedKey, error: errorMessage });
          updatedImageUrls.push(url);
        }
      }

      if (unitNeedsUpdate) {
        await Unit.findByIdAndUpdate(unit._id, { imageUrls: updatedImageUrls });
        console.log(`  💾 Updated Unit ${unit._id}`);
        result.unitsUpdated++;
      } else {
        console.log(`  ℹ️  No changes needed for Unit ${unit._id}`);
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({ file: 'N/A', error: `Decode operation failed: ${errorMessage}` });
    return result;
  }
}

async function main() {
  console.log('🔄 Decoding Unit image URLs and S3 paths...\n');
  console.log('Environment check:');
  console.log(`  S3 Bucket: ${BUCKET_NAME}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? '✓' : '✗'}\n`);

  if (!BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const result = await decodeUnitImageUrls();

  console.log('\n' + '='.repeat(70));
  console.log('📊 Decode Summary:');
  console.log('='.repeat(70));
  console.log(`Units with encoded URLs: ${result.totalUnitsWithEncodedUrls}`);
  console.log(`Total image URLs processed: ${result.totalImageUrls}`);
  console.log(`✅ Images renamed (decoded): ${result.imagesRenamed}`);
  console.log(`✅ Images already decoded: ${result.imagesAlreadyDecoded}`);
  console.log(`❌ Images missing: ${result.imagesMissing}`);
  console.log(`💾 Units updated: ${result.unitsUpdated}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
    result.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.file}`);
      console.log(`     Error: ${err.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }

  if (result.imagesMissing === 0 && result.errors.length === 0) {
    console.log('\n✅ All URLs and paths decoded successfully!');
    console.log(`Renamed ${result.imagesRenamed} images to use Chinese characters.`);
    console.log(`Updated ${result.unitsUpdated} Unit records with decoded URLs.`);
    process.exit(0);
  } else {
    console.log('\n⚠️  Decode completed with errors');
    process.exit(1);
  }
}

main();
