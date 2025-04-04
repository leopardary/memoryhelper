import mongoose from 'mongoose';
import * as dotenv from 'dotenv'

dotenv.config()

// Connect to MongoDB
export async function connectDB() {
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
