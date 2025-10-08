import { Types } from 'mongoose';
import { RoleName } from './Role.types';

export interface UserProps {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  imageUrl?: string;
  password?: string;
  defaultRole: RoleName;  // Fallback role when no specific assignment
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new user
export type CreateUserInput = Omit<UserProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing user
export type UpdateUserInput = Partial<CreateUserInput>; 