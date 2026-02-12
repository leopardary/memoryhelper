import * as dotenv from 'dotenv';
import { connectDB } from '../src/lib/db/utils';
import MemoryPiece from '../src/lib/db/model/MemoryPiece';

dotenv.config({ path: '.env.local' });
dotenv.config();

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

function getFileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

async function rollbackDatabaseUrls(): Promise<number> {
  console.log('Rolling back database URLs...');

  await connectDB();
  console.log('Connected to MongoDB');

  const memoryPieces = await MemoryPiece.find({
    imageUrls: { $exists: true, $ne: [] }
  }).lean();

  let rolledBackCount = 0;

  for (const piece of memoryPieces) {
    if (!piece.imageUrls || piece.imageUrls.length === 0) continue;

    let needsRollback = false;
    const rolledBackImageUrls = piece.imageUrls.map(url => {
      // Check if URL points to new memoryPieces/ location
      if (url.includes('/memoryPieces/')) {
        needsRollback = true;
        // Extract filename and restore to old Home/ URL
        const fileName = getFileName(url);
        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/Home/${fileName}`;
      }
      return url;
    });

    if (needsRollback) {
      await MemoryPiece.findByIdAndUpdate(piece._id, {
        imageUrls: rolledBackImageUrls,
      });
      console.log(`  💾 Rolled back MemoryPiece ${piece._id}`);
      rolledBackCount++;
    }
  }

  return rolledBackCount;
}

async function main() {
  console.log('🔄 Rolling back MemoryPiece URLs: memoryPieces/ → Home/...\n');

  const count = await rollbackDatabaseUrls();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Rollback Summary:');
  console.log('='.repeat(60));
  console.log(`💾 MemoryPieces rolled back: ${count}`);

  if (count > 0) {
    console.log('\n✅ Rollback completed successfully!');
    console.log('URLs have been restored to point to Home/ folder.');
  } else {
    console.log('\n✅ No rollback needed - all URLs are correct.');
  }

  process.exit(0);
}

main();
