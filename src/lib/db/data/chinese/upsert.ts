import mongoose from 'mongoose';
import MemoryPiece from '@/lib/db/model/MemoryPiece'
import Subject from '@/lib/db/model/Subject'
import { validateImagePath } from '@/lib/utils/fileValidation';
import { CreateSubjectInput } from '@/lib/db/model/types/Subject.types';
import { CreateMemoryPieceInput } from '@/lib/db/model/types/MemoryPiece.types';
import { connectDB } from '@/lib/db/utils';
import {getSubjectByTitle} from '@/lib/db/api/subject';
import data from '@/lib/db/data/chinese/seed_4a1';

// Check existence or create MemoryPiece
async function findOrCreateMemoryPiece(data: CreateMemoryPieceInput) {
  try {
    // First, attempt to find the record using `content` (assuming it's unique)
    let record = await MemoryPiece.findOneAndUpdate(
      { content: data.content },
      data,
      { upsert: true, new: true }
    );
    
    console.log('Memory piece found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateMemoryPiece:', error);
    throw error;
  }
}

// Check existence or create subject


// Example Usage
async function main() {
  try {

    const yuwen_subject_result = await getSubjectByTitle("语文");
    console.log('Subject 语文 found:', yuwen_subject_result);

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
