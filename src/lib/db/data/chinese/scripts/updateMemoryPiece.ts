import mongoose from 'mongoose';
import MemoryPiece from '@/lib/db/model/MemoryPiece';
import { connectDB } from '@/lib/db/utils';

// Migrate MemoryPiece table to contain `units` to have an array of linked `unit`, instead of `unit` to contain only one unit.

export async function migrateMemoryPieces() {
  try {
    await connectDB();
    const originalMemoryPieces = await MemoryPiece.find();
    for (const memoryPiece of originalMemoryPieces) {
      // memoryPiece.units = [memoryPiece.units];
      // memoryPiece.unit = undefined; // or: delete post.author;
      await memoryPiece.save();
    }
  } catch (error) {
    console.error('Error processing seed data:', error);
    throw error;     
  }
}

// Example Usage
async function main() {
  try {
    await migrateMemoryPieces();
  } catch (error) {
    console.error('Main execution error:', error);
  } finally {
    // Close the connection when done
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);

/**
 * To run this file, execute `npx tsx src/lib/db/data/chinese/updateMemoryPiece.ts` in commandline
 */