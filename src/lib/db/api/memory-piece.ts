import MemoryPiece from '@/lib/db/model/MemoryPiece';
import { connectDB } from '@/lib/db/utils';
import { CreateMemoryPieceInput, UpdateMemoryPieceInput } from '@/lib/db/model/types/MemoryPiece.types';
import { getSubscriptionsDueToCheckForUser } from '@/lib/db/api/subscription';

export async function createMemoryPiece(data: CreateMemoryPieceInput) {
  await connectDB();
  return MemoryPiece.create(data);
}

export async function getMemoryPiece(id: string) {
  await connectDB();
  return MemoryPiece.findById(id)
    .populate('units');
}

export async function getMemoryPiecesByUnit(unitId: string) {
  await connectDB();
  return MemoryPiece.find({ unit: unitId })
    .populate('units');
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
    .populate('units');
}

// Check existence or create MemoryPiece
export async function findOrCreateMemoryPiece(data: CreateMemoryPieceInput) {
  try {
    // First, attempt to find the record using `content` (assuming it's unique)
    const record = await MemoryPiece.findOneAndUpdate(
      { content: data.content },
      data,
      { upsert: true, new: true }
    );
    
    console.log('Memory piece found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateMemoryPiece:', error);
    throw error;
  }
}

export async function findMemoryPiecesInBatch(ids: string[]) {
  await connectDB();
  const memoryPieces = [];
  for (const id of ids) {
    try {
      const memoryPiece = await MemoryPiece.findById(id);
      memoryPieces.push(memoryPiece);
    } catch (e) {
      console.error(`MemoryPiece with id ${id} not found due to error: `, e);
    }
  }
  return memoryPieces;
}


// get a list of memory pieces that user should practice today.
export async function memoryPieceToPracticeToday(userId: string) {
  const dueSubscriptions = (await getSubscriptionsDueToCheckForUser(userId));
  return await findMemoryPiecesInBatch(dueSubscriptions.map(subscription => subscription.memoryPieceId.toString()));
}