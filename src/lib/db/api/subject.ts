import Subject from '@/lib/db/model/Subject';
import { CreateSubjectInput, UpdateSubjectInput } from '@/lib/db/model/types/Subject.types';
import { connectDB } from '@/lib/db/utils';
import { validateImagePath } from '@/lib/utils/fileValidation';

export async function createSubject(data: CreateSubjectInput) {
  await connectDB();
  return Subject.create(data);
}

export async function getSubject(id: string) {
  await connectDB();
  return Subject.findById(id);
}

export async function getSubjectByTitle(title: string) {
  try {
    await connectDB();
    return await Subject.findOne({ title: title });
  } catch (error) {
    console.error(`Subject ${title} Not Found:`, error);
    throw error;
  }
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

// Check existence or create subject
export async function findOrCreateSubject(subject: CreateSubjectInput) {
  try {
    if (subject?.imageUrls && !validateImagePath(subject.imageUrls)) {
      throw new Error(`Image files not found: ${subject.imageUrls}`);
    }

    const record = await Subject.findOneAndUpdate(
      { title: subject.title },
      subject,
      { upsert: true, new: true }
    );
    
    console.log('Subject found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateSubject:', error);
    throw error;
  }
}