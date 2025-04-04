import { Types } from 'mongoose';

export interface MemoryPieceProps {
  _id?: Types.ObjectId;
  subject: Types.ObjectId;
  unit?: Types.ObjectId;
  content: string;
  imageUrl?: string;
  description?: string;
  labels?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new memory piece
export type CreateMemoryPieceInput = Omit<MemoryPieceProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing memory piece
export type UpdateMemoryPieceInput = Partial<CreateMemoryPieceInput>; 