import * as dotenv from 'dotenv';
import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { connectDB } from '../src/lib/db/utils';
import Subject from '../src/lib/db/model/Subject';
import Unit from '../src/lib/db/model/Unit';
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

interface ImportResult {
  subjectsCreated: number;
  unitsCreated: number;
  memoryPiecesCreated: number;
  imagesUploaded: number;
  errors: Array<{ path: string; error: string }>;
}

interface MemoryPieceRow {
  content: string;
  label: string;
}

interface UnitNode {
  title: string;
  path: string;
  fsPath: string;
  children: UnitNode[];
  memoryPiecesCSV?: string;
}

// Parse CSV file (simple parser for 2-column format)
function parseCSV(filePath: string): MemoryPieceRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes('content') ? 1 : 0;

  return lines.slice(startIndex).map(line => {
    // Simple CSV parsing - handles quoted fields
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    return {
      content: parts[0]?.replace(/^"|"$/g, '').trim() || '',
      label: parts[1]?.replace(/^"|"$/g, '').trim() || '',
    };
  }).filter(row => row.content); // Filter out empty rows
}

// Build unit tree from filesystem
function buildUnitTree(dirPath: string, currentPath: string = ''): UnitNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: UnitNode[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dirPath, entry.name);
      const unitPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

      // Check if this directory contains a memory-pieces.csv file
      const csvPath = path.join(fullPath, 'memory-pieces.csv');
      const hasCSV = fs.existsSync(csvPath);

      const node: UnitNode = {
        title: entry.name,
        path: unitPath,
        fsPath: fullPath,
        children: buildUnitTree(fullPath, unitPath),
        memoryPiecesCSV: hasCSV ? csvPath : undefined,
      };

      nodes.push(node);
    }
  }

  return nodes;
}

// Upload file to S3
async function uploadToS3(
  filePath: string,
  s3Key: string
): Promise<string> {
  const fileContent = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Determine content type based on extension
  const contentTypeMap: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  const contentType = contentTypeMap[ext] || 'application/octet-stream';

  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  }).promise();

  return `${S3_BASE_URL}/${s3Key}`;
}

// Create or get MemoryPiece with images and description
async function createMemoryPiece(
  content: string,
  label: string,
  memoryPiecesDir: string,
  unitId: string,
  result: ImportResult
): Promise<any> {
  // Check if MemoryPiece already exists
  let memoryPiece = await MemoryPiece.findOne({ content });

  if (memoryPiece) {
    console.log(`  MemoryPiece "${content}" already exists, reusing`);
    // Add unit to the memory piece's units array if not already present
    if (!memoryPiece.units.includes(unitId as any)) {
      memoryPiece.units.push(unitId as any);
      await memoryPiece.save();
    }
    return memoryPiece;
  }

  const contentDir = path.join(memoryPiecesDir, content);
  const imageUrls: string[] = [];
  let description = '';

  // Check if content directory exists
  if (fs.existsSync(contentDir)) {
    // Read description.txt if exists
    const descPath = path.join(contentDir, 'description.txt');
    if (fs.existsSync(descPath)) {
      description = fs.readFileSync(descPath, 'utf-8').trim();
    }

    // Upload all image files
    const files = fs.readdirSync(contentDir);
    for (const file of files) {
      if (file === 'description.txt') continue;

      const filePath = path.join(contentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          try {
            const s3Key = `Home/${content}/${file}`;
            const url = await uploadToS3(filePath, s3Key);
            imageUrls.push(url);
            result.imagesUploaded++;
            console.log(`    ✅ Uploaded image: ${s3Key}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push({
              path: filePath,
              error: `Failed to upload image: ${errorMessage}`,
            });
            console.log(`    ❌ Failed to upload ${file}: ${errorMessage}`);
          }
        }
      }
    }
  } else {
    console.log(`    ⚠️  Warning: Directory not found for content "${content}"`);
  }

  // Create MemoryPiece
  const newMemoryPiece = await MemoryPiece.create({
    content,
    description,
    imageUrls,
    labels: label ? [label] : [],
    units: [unitId],
  });

  result.memoryPiecesCreated++;
  console.log(`  ✅ Created MemoryPiece: "${content}" with ${imageUrls.length} images`);

  return newMemoryPiece;
}

// Upload images from unit directory to S3
async function uploadUnitImages(
  unitFsPath: string,
  s3BasePath: string,
  result: ImportResult
): Promise<string[]> {
  const imageUrls: string[] = [];

  if (!fs.existsSync(unitFsPath)) {
    return imageUrls;
  }

  try {
    const files = fs.readdirSync(unitFsPath);

    for (const file of files) {
      const filePath = path.join(unitFsPath, file);
      const stat = fs.statSync(filePath);

      // Skip directories and non-image files
      if (!stat.isFile()) continue;

      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) continue;

      try {
        const s3Key = `${s3BasePath}/${file}`;
        const url = await uploadToS3(filePath, s3Key);
        imageUrls.push(url);
        result.imagesUploaded++;
        console.log(`    ✅ Uploaded unit image: ${s3Key}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          path: filePath,
          error: `Failed to upload unit image: ${errorMessage}`,
        });
        console.log(`    ❌ Failed to upload unit image ${file}: ${errorMessage}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`    ⚠️  Warning: Could not read unit directory: ${errorMessage}`);
  }

  return imageUrls;
}

// Recursively create units from tree
async function createUnitsFromTree(
  nodes: UnitNode[],
  subjectId: string,
  subjectTitle: string,
  parentUnitId: string | null,
  memoryPiecesDir: string,
  result: ImportResult
): Promise<void> {
  for (const node of nodes) {
    console.log(`\nProcessing Unit: "${node.title}"`);

    // Build the full path for S3 uploads
    const unitS3Path = `units/${subjectTitle}/${node.path}`;

    // Check if unit already exists (idempotent)
    let unit = await Unit.findOne({
      title: node.title,
      subjectId,
      parentUnitId,
    }).lean();

    let isNewUnit = false;
    if (unit) {
      console.log(`  Unit "${node.title}" already exists, reusing`);
    } else {
      // Upload images from unit directory
      console.log(`  Scanning for unit images...`);
      const imageUrls = await uploadUnitImages(node.fsPath, unitS3Path, result);

      if (imageUrls.length > 0) {
        console.log(`  Found ${imageUrls.length} images for unit`);
      }

      // Create Unit
      unit = await Unit.create({
        title: node.title,
        subjectId,
        parentUnitId,
        type: node.children.length > 0 ? 'chapter' : 'lesson',
        imageUrls,
        memoryPieceIds: [],
      });

      result.unitsCreated++;
      isNewUnit = true;
      console.log(`  ✅ Created Unit: "${node.title}" with ${imageUrls.length} images`);
    }

    // Process memory pieces CSV if exists
    if (node.memoryPiecesCSV) {
      console.log(`  Processing memory pieces from CSV...`);
      try {
        const rows = parseCSV(node.memoryPiecesCSV);
        let memoryPieceCount = 0;

        for (const row of rows) {
          await createMemoryPiece(
            row.content,
            row.label,
            memoryPiecesDir,
            unit._id.toString(),
            result
          );
          memoryPieceCount++;
        }

        console.log(`  ✅ Associated ${memoryPieceCount} memory pieces with unit`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          path: node.memoryPiecesCSV,
          error: `Failed to process CSV: ${errorMessage}`,
        });
        console.log(`  ❌ Failed to process CSV: ${errorMessage}`);
      }
    }

    // Process children recursively
    if (node.children.length > 0) {
      await createUnitsFromTree(
        node.children,
        subjectId,
        subjectTitle,
        unit._id.toString(),
        memoryPiecesDir,
        result
      );
    }
  }
}

async function importFromFilesystem(
  subjectDir: string,
  memoryPiecesDir: string
): Promise<ImportResult> {
  const result: ImportResult = {
    subjectsCreated: 0,
    unitsCreated: 0,
    memoryPiecesCreated: 0,
    imagesUploaded: 0,
    errors: [],
  };

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Verify directories exist
    if (!fs.existsSync(subjectDir)) {
      throw new Error(`Subject directory not found: ${subjectDir}`);
    }
    if (!fs.existsSync(memoryPiecesDir)) {
      throw new Error(`Memory pieces directory not found: ${memoryPiecesDir}`);
    }

    // Get subject name from directory
    const subjectTitle = path.basename(subjectDir);
    console.log(`Processing Subject: "${subjectTitle}"`);

    // Check if subject already exists
    let subject = await Subject.findOne({ title: subjectTitle }).lean();

    if (subject) {
      console.log(`  Subject "${subjectTitle}" already exists, reusing`);
      result.subjectsCreated = 0;
    } else {
      // Create Subject
      subject = await Subject.create({
        title: subjectTitle,
        description: '',
        imageUrls: [],
        labels: [],
      });
      result.subjectsCreated = 1;
      console.log(`  ✅ Created Subject: "${subjectTitle}"`);
    }

    // Build unit tree from filesystem
    console.log('\nBuilding unit tree from filesystem...');
    const unitTree = buildUnitTree(subjectDir);
    console.log(`Found ${unitTree.length} root units\n`);

    // Create units and memory pieces recursively
    await createUnitsFromTree(
      unitTree,
      subject._id.toString(),
      subjectTitle,
      null,
      memoryPiecesDir,
      result
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push({
      path: subjectDir,
      error: `Import failed: ${errorMessage}`,
    });
    return result;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npm run import:from-filesystem <subject-directory> <memory-pieces-directory>');
    console.error('\nExample:');
    console.error('  npm run import:from-filesystem ./import-data/Chinese ./import-data/memoryPieces');
    console.error('\nDirectory Structure:');
    console.error('  import-data/');
    console.error('    Chinese/                    # Subject directory (subject title)');
    console.error('      Unit1/                    # Unit directory (unit title)');
    console.error('        SubUnit1/               # Child unit directory');
    console.error('          memory-pieces.csv     # CSV with content,label columns');
    console.error('        SubUnit2/');
    console.error('          memory-pieces.csv');
    console.error('    memoryPieces/              # Memory pieces content directory');
    console.error('      我/                       # Folder named by content');
    console.error('        我.gif                  # Images for this memory piece');
    console.error('        description.txt        # Description text file');
    console.error('      你/');
    console.error('        你.jpg');
    console.error('        description.txt');
    process.exit(1);
  }

  const subjectDir = path.resolve(args[0]);
  const memoryPiecesDir = path.resolve(args[1]);

  console.log('🔄 Starting filesystem import...\n');
  console.log('Environment check:');
  console.log(`  S3 Bucket: ${BUCKET_NAME}`);
  console.log(`  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? '✓' : '✗'}`);
  console.log(`  Subject Directory: ${subjectDir}`);
  console.log(`  Memory Pieces Directory: ${memoryPiecesDir}\n`);

  if (!BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const result = await importFromFilesystem(subjectDir, memoryPiecesDir);

  console.log('\n' + '='.repeat(70));
  console.log('📊 Import Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Subjects created: ${result.subjectsCreated}`);
  console.log(`✅ Units created: ${result.unitsCreated}`);
  console.log(`✅ Memory pieces created: ${result.memoryPiecesCreated}`);
  console.log(`✅ Images uploaded: ${result.imagesUploaded}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
    result.errors.slice(0, 10).forEach((err, idx) => {
      console.log(`  ${idx + 1}. Path: ${err.path}`);
      console.log(`     Error: ${err.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }

  if (result.errors.length === 0) {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Import completed with errors');
    process.exit(1);
  }
}

main();
