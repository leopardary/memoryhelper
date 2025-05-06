import { Types } from 'mongoose';

export interface MemoryCheckProps {
  _id?: Types.ObjectId;
  memoryPiece: Types.ObjectId;
  user: Types.ObjectId;
  correctness: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new memory check
export type CreateMemoryCheckInput = Omit<MemoryCheckProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing memory check
export type UpdateMemoryCheckInput = Partial<CreateMemoryCheckInput>; 