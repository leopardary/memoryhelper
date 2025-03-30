import mongoose from 'mongoose';
import * as dotenv from 'dotenv'
import MemoryPiece from '@/lib/db/model/MemoryPiece'
import Subject from '@/lib/db/model/Subject'

dotenv.config()

// Connect to MongoDB
async function connectDB() {
  if (process.env.DATABASE_URL == undefined)
    throw new Error('DATABASE_URL empty. Please set in .env.')
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Check existence or create MemoryPiece
async function findOrCreateMemoryPiece(data: {
  subject: mongoose.Types.ObjectId;
  unit?: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  description?: string;
  labels?: string[];
}) {
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
async function findOrCreateSubject(subject: {
  title: string;
  imageUrl?: string;
  description?: string;
  labels?: string[];
}) {
  try {
    // Using findOneAndUpdate for atomic operation
    let record = await Subject.findOneAndUpdate(
      { title: subject.title },
      subject,
      { upsert: true, new: true }
    );
    
    console.log('Subject found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateSubject:', error);
    throw error;
  }
}

// Example Usage
async function main() {
  try {
    await connectDB();
    
    // Create a subject
    const subject = {
      title: "语文",
      description: "Chinese Language Arts",
      labels: ["Chinese", "Language"],
      imageUrl: ''
    };

    const subjectResult = await findOrCreateSubject(subject);
    console.log('Subject Result:', subjectResult);

    // Create a memory piece using the subject
    const memoryPiece = {
      subject: subjectResult._id,
      content: "示例内容",
      description: "Example content",
      labels: ["example"],
      imageUrl: ''
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
