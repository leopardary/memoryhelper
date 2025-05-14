import { Types } from 'mongoose';

export interface MemoryCheckProps {
  _id?: Types.ObjectId;

  /**
   * The subscription that was checked.
   * Reference to a Subscription document.
   */
  subscription: Types.ObjectId | string;

  /**
   * The score achieved during this memory check.
   * The nature of the score (e.g., 0-5, percentage) should be
   * consistently defined in your application logic.
   */
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new memory check
export type CreateMemoryCheckInput = Omit<MemoryCheckProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing memory check
export type UpdateMemoryCheckInput = Partial<CreateMemoryCheckInput>; 