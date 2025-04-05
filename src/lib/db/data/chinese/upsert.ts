import mongoose from 'mongoose';
import { CreateMemoryPieceInput } from '@/lib/db/model/types/MemoryPiece.types';
import {getSubjectByTitle} from '@/lib/db/api/subject';
import {findOrCreateMemoryPiece} from '@/lib/db/api/memory-piece'
import data from '@/lib/db/data/chinese/seed_4a1';

// Example Usage
async function main() {
  try {

    const yuwen_subject_result = await getSubjectByTitle("语文");
    console.log('Subject 语文 found:', yuwen_subject_result);
    if (yuwen_subject_result == null) {
      throw new Error('Subject 语文 is not found.')
    }
    const memoryPiece: CreateMemoryPieceInput = {
      subject: yuwen_subject_result._id,
      content: "示例内容",
      description: "Example content",
      labels: ["example"],
      imageUrl: '/images/memory-pieces/example.jpg'
    };

    const memoryPieceResult = await findOrCreateMemoryPiece(memoryPiece);
    console.log('Memory Piece Result:', memoryPieceResult);
  } catch (error) {
    console.error('Main execution error:', error);
  } finally {
    // Close the connection when done
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
