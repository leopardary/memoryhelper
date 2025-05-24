import { Types } from 'mongoose';

export interface SubscriptionProps {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  memoryPieceId: Types.ObjectId | string;
  easeFactor: number;
  currentInterval: number;
  nextTestDate: Date;
  status?: 'new' | 'learning' | 'learned' | 'lapsed';
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new subscription
export type CreateSubscriptionInput = Omit<SubscriptionProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing subscription
export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>; 