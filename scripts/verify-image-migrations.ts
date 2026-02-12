import * as dotenv from 'dotenv';
import { connectDB } from '../src/lib/db/utils';
import Subject from '../src/lib/db/model/Subject';
import MemoryPiece from '../src/lib/db/model/MemoryPiece';
import Unit from '../src/lib/db/model/Unit';
import User from '../src/lib/db/model/User';

dotenv.config({ path: '.env.local' });
dotenv.config();

interface LocalImageReport {
  collection: string;
  documentId: string;
  field: string;
  localUrls: string[];
}

function isLocalPublicImage(url: string): boolean {
  if (!url) return false;
  return url.includes('public/images') || url.startsWith('/images');
}

async function checkSubjects(): Promise<LocalImageReport[]> {
  const reports: LocalImageReport[] = [];

  const subjects = await Subject.find({
    imageUrls: { $exists: true, $ne: [] }
  }).lean();

  for (const subject of subjects) {
    if (!subject.imageUrls) continue;

    const localUrls = subject.imageUrls.filter(isLocalPublicImage);
    if (localUrls.length > 0) {
      reports.push({
        collection: 'subjects',
        documentId: subject._id.toString(),
        field: 'imageUrls',
        localUrls,
      });
    }
  }

  return reports;
}

async function checkMemoryPieces(): Promise<LocalImageReport[]> {
  const reports: LocalImageReport[] = [];

  const memoryPieces = await MemoryPiece.find({
    imageUrls: { $exists: true, $ne: [] }
  }).lean();

  for (const piece of memoryPieces) {
    if (!piece.imageUrls) continue;

    const localUrls = piece.imageUrls.filter(isLocalPublicImage);
    if (localUrls.length > 0) {
      reports.push({
        collection: 'memorypieces',
        documentId: piece._id.toString(),
        field: 'imageUrls',
        localUrls,
      });
    }
  }

  return reports;
}

async function checkUnits(): Promise<LocalImageReport[]> {
  const reports: LocalImageReport[] = [];

  const units = await Unit.find({
    imageUrls: { $exists: true, $ne: [] }
  }).lean();

  for (const unit of units) {
    if (!unit.imageUrls) continue;

    const localUrls = unit.imageUrls.filter(isLocalPublicImage);
    if (localUrls.length > 0) {
      reports.push({
        collection: 'units',
        documentId: unit._id.toString(),
        field: 'imageUrls',
        localUrls,
      });
    }
  }

  return reports;
}

async function checkUsers(): Promise<LocalImageReport[]> {
  const reports: LocalImageReport[] = [];

  const users = await User.find({
    imageUrl: { $exists: true, $ne: null }
  }).lean();

  for (const user of users) {
    if (!user.imageUrl) continue;

    if (isLocalPublicImage(user.imageUrl)) {
      reports.push({
        collection: 'users',
        documentId: user._id.toString(),
        field: 'imageUrl',
        localUrls: [user.imageUrl],
      });
    }
  }

  return reports;
}

async function main() {
  console.log('🔍 Verifying image migrations across all collections...\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Check all collections
    console.log('Checking Subjects...');
    const subjectReports = await checkSubjects();

    console.log('Checking MemoryPieces...');
    const memoryPieceReports = await checkMemoryPieces();

    console.log('Checking Units...');
    const unitReports = await checkUnits();

    console.log('Checking Users...');
    const userReports = await checkUsers();

    // Combine all reports
    const allReports = [
      ...subjectReports,
      ...memoryPieceReports,
      ...unitReports,
      ...userReports,
    ];

    // Display results
    console.log('\n' + '='.repeat(80));
    console.log('📊 Verification Summary:');
    console.log('='.repeat(80));

    console.log(`\n📂 Collection Statistics:`);
    console.log(`  Subjects with local images: ${subjectReports.length}`);
    console.log(`  MemoryPieces with local images: ${memoryPieceReports.length}`);
    console.log(`  Units with local images: ${unitReports.length}`);
    console.log(`  Users with local images: ${userReports.length}`);
    console.log(`  ────────────────────────────────────────`);
    console.log(`  TOTAL documents with local images: ${allReports.length}`);

    if (allReports.length === 0) {
      console.log('\n✅ SUCCESS! No local image URLs found in any collection.');
      console.log('All images have been successfully migrated to S3.');
      process.exit(0);
    } else {
      console.log('\n⚠️  WARNING: Found local image URLs that need migration:\n');

      // Group by collection
      const grouped = allReports.reduce((acc, report) => {
        if (!acc[report.collection]) {
          acc[report.collection] = [];
        }
        acc[report.collection].push(report);
        return acc;
      }, {} as Record<string, LocalImageReport[]>);

      // Display details for each collection
      for (const [collection, reports] of Object.entries(grouped)) {
        console.log(`\n📁 ${collection.toUpperCase()}:`);
        reports.forEach((report, idx) => {
          console.log(`  ${idx + 1}. Document ID: ${report.documentId}`);
          console.log(`     Field: ${report.field}`);
          report.localUrls.forEach(url => {
            console.log(`     - ${url}`);
          });
        });
      }

      console.log('\n💡 Suggested Actions:');
      if (memoryPieceReports.length > 0) {
        console.log('  - Run: npm run migrate:images-to-s3');
      }
      if (subjectReports.length > 0) {
        console.log('  - Run: npm run migrate:subjects-images-to-s3');
      }
      if (unitReports.length > 0) {
        console.log('  - Create and run migration script for Units');
      }
      if (userReports.length > 0) {
        console.log('  - Note: User images are typically from Google OAuth (external URLs)');
        console.log('    If these are truly local images, create a migration script');
      }

      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error during verification:');
    console.error(error);
    process.exit(1);
  }
}

main();
