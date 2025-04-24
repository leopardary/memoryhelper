import { Types } from 'mongoose';

export interface UserProps {
  _id: Types.ObjectId;
  name: string;
  email: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new user
export type CreateUserInput = Omit<UserProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing user
export type UpdateUserInput = Partial<CreateUserInput>; 