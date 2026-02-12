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

interface FixResult {
  totalUnitsWithHomeUrls: number;
  totalImageUrls: number;
  imagesCopied: number;
  imagesAlreadyExist: number;
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
  // to preserve slashes but encode special characters including Chinese
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

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

async function fixUnitImageUrls(): Promise<FixResult> {
  const result: FixResult = {
    totalUnitsWithHomeUrls: 0,
    totalImageUrls: 0,
    imagesCopied: 0,
    imagesAlreadyExist: 0,
    imagesMissing: 0,
    unitsUpdated: 0,
    errors: [],
  };

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('Finding Units with Home/ URLs...');
    const units = await Unit.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    const unitsWithHomeUrls = units.filter(unit =>
      unit.imageUrls && unit.imageUrls.some(url => url.includes('/Home/'))
    );

    result.totalUnitsWithHomeUrls = unitsWithHomeUrls.length;
    console.log(`Found ${result.totalUnitsWithHomeUrls} Units with Home/ URLs\n`);

    if (unitsWithHomeUrls.length === 0) {
      console.log('No Units found with Home/ URLs');
      return result;
    }

    // Process each unit
    for (const unit of unitsWithHomeUrls) {
      console.log(`\nProcessing Unit ${unit._id}:`);

      if (!unit.imageUrls || unit.imageUrls.length === 0) continue;

      let unitNeedsUpdate = false;
      const updatedImageUrls: string[] = [];

      for (const url of unit.imageUrls) {
        if (!url.includes('/Home/')) {
          // Keep non-Home URLs as-is
          updatedImageUrls.push(url);
          continue;
        }

        result.totalImageUrls++;

        // Extract the S3 key from the URL (e.g., "Home/subjects/chinese/image.jpg")
        const homeKey = extractS3KeyFromUrl(url);
        if (!homeKey) {
          console.log(`  ⚠️  Invalid URL format: ${url}`);
          result.errors.push({
            file: url,
            error: 'Invalid URL format',
          });
          updatedImageUrls.push(url);
          continue;
        }

        // Extract just the filename
        const fileName = getFileName(homeKey);

        // The file is currently at units/{filename} (flattened)
        const currentLocation = `units/${fileName}`;

        // Generate the new units/ key by replacing Home/ with units/ (preserving subdirectories)
        const targetKey = homeKey.replace(/^Home\//, 'units/');

        // Create the new URL with properly encoded path segments for the URL
        // but keep the actual key unencoded for S3
        const encodedUrlPath = targetKey
          .split('/')
          .map(segment => encodeURIComponent(segment))
          .join('/');
        const newUrl = `${S3_BASE_URL}/${encodedUrlPath}`;

        console.log(`  Processing: ${fileName}`);
        console.log(`    Current URL: ${url}`);
        console.log(`    Current location: ${currentLocation}`);
        console.log(`    Target location: ${targetKey}`);
        console.log(`    New URL: ${newUrl}`);

        try {
          // Check if source file exists at flattened location in units/
          let sourceExists = await fileExists(currentLocation);
          let actualSourceLocation = currentLocation;

          // If not found in units/, check if it's still in Home/
          if (!sourceExists) {
            // Try with encoded filename first
            let homeLocation = `Home/${fileName}`;
            let homeExists = await fileExists(homeLocation);

            // If not found, try with decoded filename (spaces instead of %20, etc.)
            if (!homeExists) {
              const decodedFileName = decodeURIComponent(fileName);
              homeLocation = `Home/${decodedFileName}`;
              homeExists = await fileExists(homeLocation);
            }

            if (homeExists) {
              console.log(`    ⚠️  File found in Home/ instead of units/: ${homeLocation}`);
              actualSourceLocation = homeLocation;
              sourceExists = true;
            }
          }

          if (!sourceExists) {
            console.log(`    ❌ Source file not found at: ${currentLocation} or Home/${fileName}`);
            result.imagesMissing++;
            result.errors.push({
              file: currentLocation,
              error: 'Source file not found at flattened location or Home/',
            });
            // Keep the original URL even though file is missing
            updatedImageUrls.push(url);
            continue;
          }

          // Check if destination already exists
          const destExists = await fileExists(targetKey);
          if (destExists) {
            console.log(`    ⏭️  Already exists at destination: ${targetKey}`);
            result.imagesAlreadyExist++;
            // Update URL to point to units/ even if file already exists
            updatedImageUrls.push(newUrl);
            unitNeedsUpdate = true;
            continue;
          }

          // Copy file from actualSourceLocation to units/{subdirs}/{filename}
          await copyFile(actualSourceLocation, targetKey);
          console.log(`    ✅ Copied from ${actualSourceLocation} to: ${targetKey}`);
          result.imagesCopied++;

          // Add the new URL
          updatedImageUrls.push(newUrl);
          unitNeedsUpdate = true;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`    ❌ Failed: ${errorMessage}`);
          result.errors.push({
            file: currentLocation,
            error: errorMessage,
          });
          // Keep original URL on error
          updatedImageUrls.push(url);
        }
      }

      // Update the Unit document if any URLs were changed
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
    result.errors.push({
      file: 'N/A',
      error: `Fix operation failed: ${errorMessage}`,
    });
    return result;
  }
}

async function main() {
  console.log('🔧 Fixing Unit image URLs from Home/ to units/...\n');
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

  const result = await fixUnitImageUrls();

  console.log('\n' + '='.repeat(70));
  console.log('📊 Fix Summary:');
  console.log('='.repeat(70));
  console.log(`Units with Home/ URLs: ${result.totalUnitsWithHomeUrls}`);
  console.log(`Total image URLs processed: ${result.totalImageUrls}`);
  console.log(`✅ Images copied: ${result.imagesCopied}`);
  console.log(`⏭️  Images already exist: ${result.imagesAlreadyExist}`);
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
    console.log('\n✅ All Unit image URLs fixed successfully!');
    console.log(`Copied ${result.imagesCopied} images from units/ root to subdirectories.`);
    console.log(`Updated ${result.unitsUpdated} Unit records to point to correct paths.`);
    process.exit(0);
  } else if (result.imagesMissing > 0) {
    console.log('\n⚠️  Fix completed with missing files');
    console.log(`${result.imagesMissing} images could not be found in the units/ folder.`);
    process.exit(1);
  } else {
    console.log('\n⚠️  Fix completed with errors');
    process.exit(1);
  }
}

main();
