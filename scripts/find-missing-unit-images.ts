import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';

dotenv.config({ path: '.env.local' });
dotenv.config();

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

async function listAllFiles(prefix: string): Promise<string[]> {
  const files: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }).promise();

    if (response.Contents) {
      files.push(...response.Contents.map(obj => obj.Key!));
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return files;
}

async function main() {
  console.log('Searching for missing files...\n');

  // Get all files
  const allFiles = await listAllFiles('');
  console.log(`Total files in bucket: ${allFiles.length}\n`);

  // Search for files containing "23-700"
  console.log('1. Searching for files containing "23-700"...');
  const matching1 = allFiles.filter(f => f.includes('23-700'));
  console.log(`Found ${matching1.length} file(s):`);
  matching1.forEach(f => console.log(`  - ${f}`));

  // Search for Screenshot files
  console.log('\n2. Searching for files containing "Screenshot" and "2025-11-02"...');
  const matching2 = allFiles.filter(f =>
    f.toLowerCase().includes('screenshot') &&
    (f.includes('2025-11-02') || f.includes('6.28.25'))
  );
  console.log(`Found ${matching2.length} file(s):`);
  matching2.forEach(f => console.log(`  - ${f}`));

  // List all files in units/ folder (just filenames)
  console.log('\n3. Checking units/ folder root...');
  const unitsFiles = allFiles.filter(f => f.startsWith('units/') && !f.slice(6).includes('/'));
  console.log(`Files in units/ root: ${unitsFiles.length}`);

  // Check if our specific files are in Home/
  console.log('\n4. Checking if files are in Home/ folder...');
  const inHome1 = allFiles.filter(f => f.includes('Home/') && f.includes('23-700'));
  const inHome2 = allFiles.filter(f => f.includes('Home/') && f.includes('Screenshot') && f.includes('6.28.25'));
  console.log(`23-700.jpeg in Home/: ${inHome1.length > 0 ? 'YES' : 'NO'}`);
  if (inHome1.length > 0) inHome1.forEach(f => console.log(`  - ${f}`));
  console.log(`Screenshot in Home/: ${inHome2.length > 0 ? 'YES' : 'NO'}`);
  if (inHome2.length > 0) inHome2.forEach(f => console.log(`  - ${f}`));
}

main();
