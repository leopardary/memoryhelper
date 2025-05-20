import { Types } from 'mongoose';

export interface SubjectProps {
  _id?: Types.ObjectId;
  title: string;
  description?: string | null;
  imageUrls?: string[] | null;
  labels?: string[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new subject
export type CreateSubjectInput = Omit<SubjectProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing subject
export type UpdateSubjectInput = Partial<CreateSubjectInput>; 