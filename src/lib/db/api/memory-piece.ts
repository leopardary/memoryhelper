import MemoryPiece from '@/lib/db/model/MemoryPiece';
import { connectDB } from '@/lib/db/utils';
import { CreateMemoryPieceInput, UpdateMemoryPieceInput } from '@/lib/db/model/types/MemoryPiece.types';

export async function createMemoryPiece(data: CreateMemoryPieceInput) {
  await connectDB();
  return MemoryPiece.create(data);
}

export async function getMemoryPiece(id: string) {
  await connectDB();
  return MemoryPiece.findById(id)
    .populate('subject')
    .populate('unit')
    .populate('memoryChecks');
}

export async function getMemoryPiecesByUnit(unitId: string) {
  await connectDB();
  return MemoryPiece.find({ unit: unitId })
    .populate('subject')
    .populate('unit');
}

export async function updateMemoryPiece(id: string, data: UpdateMemoryPieceInput) {
  await connectDB();
  return MemoryPiece.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteMemoryPiece(id: string) {
  await connectDB();
  return MemoryPiece.findByIdAndDelete(id);
}

// Additional helper function to find by content
export async function getMemoryPieceByContent(content: string) {
  await connectDB();
  return MemoryPiece.findOne({ content })
    .populate('subject')
    .populate('unit');
}