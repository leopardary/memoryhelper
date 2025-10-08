import { Types } from 'mongoose';

export type RoleName = 'visitor' | 'student' | 'teacher' | 'administrator';

export type Permission =
  | 'view'
  | 'practice'
  | 'manage_content'
  | 'manage_student'
  | 'manage_subject'
  | 'manage_teacher';

export interface RoleProps {
  _id: Types.ObjectId | string;
  name: RoleName;
  displayName: string;
  description?: string;
  permissions: Permission[];  // Base permissions granted by this role
  isGlobal: boolean;  // true = permissions apply globally; false = permissions apply only to assigned subjects
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new role
export type CreateRoleInput = Omit<RoleProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing role
export type UpdateRoleInput = Partial<CreateRoleInput>;
