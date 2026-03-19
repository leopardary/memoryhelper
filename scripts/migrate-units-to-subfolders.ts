import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';
import { connectDB } from '../src/lib/db/utils';
import Unit from '../src/lib/db/model/Unit';
import Subject from '../src/lib/db/model/Subject';

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
  totalUnits: number;
  unitsProcessed: number;
  totalImageUrls: number;
  imagesMoved: number;
  imagesAlreadyInSubfolder: number;
  imagesNotFound: number;
  unitsUpdated: number;
  errors: Array<{ unitId: string; title: string; error: string }>;
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

function getBasePath(key: string): string {
  const parts = key.split('/');
  parts.pop(); // Remove filename
  return parts.join('/');
}

function isAlreadyInTitleSubfolder(key: string, title: string): boolean {
  // Check if the key ends with: /{title}/{filename}
  const parts = key.split('/');
  if (parts.length < 2) return false;
  const folderName = parts[parts.length - 2];
  return folderName === title;
}

// Build the full hierarchical path for a unit
async function buildUnitPath(unit: any): Promise<string> {
  const pathParts: string[] = ['units'];

  // Get subject title
  if (unit.subjectId) {
    const subject = await Subject.findById(unit.subjectId).lean();
    if (subject) {
      pathParts.push(subject.title);
    }
  }

  // Build hierarchy by traversing parent units
  const hierarchy: string[] = [];
  let currentUnit = unit;

  while (currentUnit) {
    hierarchy.unshift(currentUnit.title);

    if (currentUnit.parentUnitId) {
      currentUnit = await Unit.findById(currentUnit.parentUnitId).lean();
    } else {
      break;
    }
  }

  // Remove the last item (current unit's title) as it will be added separately
  hierarchy.pop();

  pathParts.push(...hierarchy);

  return pathParts.join('/');
}

async function migrateUnitsToSubfolders(): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalUnits: 0,
    unitsProcessed: 0,
    totalImageUrls: 0,
    imagesMoved: 0,
    imagesAlreadyInSubfolder: 0,
    imagesNotFound: 0,
    unitsUpdated: 0,
    errors: [],
  };

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB\n');

    console.log('Finding Units with images...');
    const units = await Unit.find({
      imageUrls: { $exists: true, $ne: [] }
    }).lean();

    result.totalUnits = units.length;
    console.log(`Found ${result.totalUnits} Units with images\n`);

    if (units.length === 0) {
      console.log('No Units found with images');
      return result;
    }

    for (const unit of units) {
      console.log(`\nProcessing Unit ${unit._id}:`);
      console.log(`  Title: "${unit.title}"`);

      if (!unit.imageUrls || unit.imageUrls.length === 0) continue;

      result.unitsProcessed++;
      let needsUpdate = false;
      const updatedImageUrls: string[] = [];

      // Build the expected base path for this unit
      const unitBasePath = await buildUnitPath(unit);
      console.log(`  Expected base path: ${unitBasePath}`);

      for (const url of unit.imageUrls) {
        result.totalImageUrls++;

        const currentKey = extractS3KeyFromUrl(url);
        if (!currentKey) {
          console.log(`  ⚠️  Invalid URL format: ${url}`);
          result.errors.push({
            unitId: unit._id.toString(),
            title: unit.title,
            error: `Invalid URL format: ${url}`
          });
          updatedImageUrls.push(url);
          continue;
        }

        // Check if already in title subfolder
        if (isAlreadyInTitleSubfolder(currentKey, unit.title)) {
          console.log(`  ✅ Already in subfolder: ${currentKey}`);
          result.imagesAlreadyInSubfolder++;
          updatedImageUrls.push(url);
          continue;
        }

        // Get filename and construct new key
        const fileName = getFileName(currentKey);
        const decodedFileName = decodeURIComponent(fileName);

        // Determine the base path from current key or use built path
        let basePath = getBasePath(currentKey);

        // If current key doesn't start with "units/", use the built path
        if (!currentKey.startsWith('units/')) {
          basePath = unitBasePath;
        }

        const newKey = `${basePath}/${unit.title}/${decodedFileName}`;
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
              unitId: unit._id.toString(),
              title: unit.title,
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
            unitId: unit._id.toString(),
            title: unit.title,
            error: `Failed to move ${currentKey}: ${errorMessage}`
          });
          updatedImageUrls.push(url);
        }
      }

      // Update the Unit document if any URLs were changed
      if (needsUpdate) {
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
      unitId: 'N/A',
      title: 'N/A',
      error: `Migration failed: ${errorMessage}`
    });
    return result;
  }
}

async function main() {
  console.log('🔄 Migrating Unit images to title subfolders...\n');
  console.log('Environment check:');
  console.log(`  S3 Bucket: ${BUCKET_NAME}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? '✓' : '✗'}\n`);

  if (!BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const result = await migrateUnitsToSubfolders();

  console.log('\n' + '='.repeat(70));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(70));
  console.log(`Total Units with images: ${result.totalUnits}`);
  console.log(`Units processed: ${result.unitsProcessed}`);
  console.log(`Total image URLs: ${result.totalImageUrls}`);
  console.log(`✅ Images moved: ${result.imagesMoved}`);
  console.log(`✅ Images already in subfolder: ${result.imagesAlreadyInSubfolder}`);
  console.log(`❌ Images not found: ${result.imagesNotFound}`);
  console.log(`💾 Units updated: ${result.unitsUpdated}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
    result.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. Unit: ${err.unitId} (Title: "${err.title}")`);
      console.log(`     Error: ${err.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }

  if (result.imagesNotFound === 0 && result.errors.length === 0) {
    console.log('\n✅ All Unit images migrated successfully!');
    console.log(`Moved ${result.imagesMoved} images to title-specific subfolders.`);
    console.log(`Updated ${result.unitsUpdated} Unit records.`);
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration completed with errors');
    process.exit(1);
  }
}

main();
