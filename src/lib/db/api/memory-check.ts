'use server'
import MemoryCheck from '@/lib/db/model/MemoryCheck';
import { connectDB } from '@/lib/db/utils';
import { CreateMemoryCheckInput, UpdateMemoryCheckInput } from '@/lib/db/model/types/MemoryCheck.types';

export async function createMemoryCheck(data: CreateMemoryCheckInput) {
  await connectDB();
  return MemoryCheck.create(data);
}

export async function getMemoryCheck(id: string) {
  await connectDB();
  return MemoryCheck.findById(id);
}

export async function updateMemoryCheck(id: string, data: UpdateMemoryCheckInput) {
  await connectDB();
  return MemoryCheck.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteMemoryCheck(id: string) {
  await connectDB();
  return MemoryCheck.findByIdAndDelete(id);
}

export async function createMemoryCheckInBatch(data: CreateMemoryCheckInput[]) {
  await connectDB();
  const memoryChecks = [];
  for (const memoryCheck of data) {
    try {
      const record = await MemoryCheck.create(memoryCheck);
      memoryChecks.push(record._id.toString());
    } catch (e) {
      console.error(`MemoryCheck ${memoryCheck} not found due to error: `, e);
    }
  }
  return memoryChecks;
}

export async function findMemoryChecksInBatch(ids: string[]) {
  await connectDB();
  const memoryChecks = [];
  for (const id of ids) {
    try {
      const memoryCheck = await MemoryCheck.findById(id);
      memoryChecks.push(memoryCheck);
    } catch (e) {
      console.error(`MemoryCheck with id ${id} not found due to error: `, e);
    }
  }
  return memoryChecks;
}