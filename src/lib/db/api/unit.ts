import Unit from '@/lib/db/model/Unit';
import { connectDB } from '@/lib/db/utils';
import { CreateUnitInput, UpdateUnitInput } from '@/lib/db/model/types/Unit.types';

export async function createUnit(data: CreateUnitInput) {
  await connectDB();
  return Unit.create(data);
}

export async function getUnit(id: string) {
  await connectDB();
  return Unit.findById(id)
    .populate('parent')
    .populate('children')
    .populate('memoryPieces')
    .populate('subject');
}

export async function getUnitsBySubject(subjectId: string) {
  await connectDB();
  return Unit.find({ subject: subjectId })
    .sort({ order: 1 });
}

export async function updateUnit(id: string, data: UpdateUnitInput) {
  await connectDB();
  return Unit.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteUnit(id: string) {
  await connectDB();
  return Unit.findByIdAndDelete(id);
}