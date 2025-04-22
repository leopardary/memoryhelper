import { Types } from 'mongoose';

export interface SubscriptionProps {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  memoryPieceId: Types.ObjectId;
  status?: 'active' | 'paused' | 'completed';
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new subscription
export type CreateSubscriptionInput = Omit<SubscriptionProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing subscription
export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>; 