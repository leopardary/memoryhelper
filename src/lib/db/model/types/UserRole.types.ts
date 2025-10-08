import { Types } from 'mongoose';

export interface UserRoleProps {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  roleId: Types.ObjectId | string;
  subjectId?: Types.ObjectId | string | null;  // null for global roles (visitor, administrator)
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new user role assignment
export type CreateUserRoleInput = Omit<UserRoleProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing user role
export type UpdateUserRoleInput = Partial<CreateUserRoleInput>;
