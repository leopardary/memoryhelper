import mongoose from 'mongoose';
import * as dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.DATABASE_URL!;

if (!MONGODB_URI) {
  throw new Error("Please define the DATABASE_URL environment variable.");
}

function getMongoose(global: any) {
  return global.mongoose;
}

const cached: any = getMongoose(global) || {conn: null, promise: null};

// Connect to MongoDB
export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {bufferCommands: false});
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

if (typeof global != 'undefined') {
  Object.defineProperty(global, 'mongoose', {value: cached, writable: false});
}