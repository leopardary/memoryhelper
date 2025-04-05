import { Types } from 'mongoose';

export type UnitType = 'chapter' | 'lesson' | 'module';

export interface UnitProps {
  _id?: Types.ObjectId;
  title: string;
  type: UnitType;
  description?: string;
  imageUrl?: string;
  parentUnit?: Types.ObjectId;
  subject: Types.ObjectId;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating a new unit
export type CreateUnitInput = Omit<UnitProps, '_id' | 'createdAt' | 'updatedAt'>;

// For updating an existing unit
export type UpdateUnitInput = Partial<CreateUnitInput>; 