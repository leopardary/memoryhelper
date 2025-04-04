import Subject from '@/lib/db/model/Subject';
import { CreateSubjectInput, UpdateSubjectInput } from '@/lib/db/model/types/Subject.types';
import { connectDB } from '@/lib/db/utils';

export async function createSubject(data: CreateSubjectInput) {
  await connectDB();
  return Subject.create(data);
}

export async function getSubject(id: string) {
  await connectDB();
  return Subject.findById(id)
    .populate('units')
    .populate('memoryPieces');
}

export async function getAllSubjects() {
  await connectDB();
  return Subject.find()
    .populate('units');
}

export async function updateSubject(id: string, data: UpdateSubjectInput) {
  await connectDB();
  return Subject.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteSubject(id: string) {
  await connectDB();
  return Subject.findByIdAndDelete(id);
}

export async function getSubjectCount() {
  await connectDB();
  return Subject.countDocuments();
}

export async function getSubjectsWithPagination(currentPage: number, pageSize: number, heroItemCount: number) {
  await connectDB();
  return Subject.find()
    .sort({ _id: -1 })
    .skip((currentPage - 1) * pageSize + (currentPage === 1 ? 0 : heroItemCount))
    .limit(pageSize + (currentPage === 1 ? heroItemCount : 0));
}