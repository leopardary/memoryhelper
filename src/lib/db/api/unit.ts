import Unit from '@/lib/db/model/Unit';
import { connectDB } from '@/lib/db/utils';
import { CreateUnitInput, UpdateUnitInput } from '@/lib/db/model/types/Unit.types';
import { validateImagePath } from '@/lib/utils/fileValidation';

export async function createUnit(data: CreateUnitInput) {
  await connectDB();
  return Unit.create(data);
}

export async function getUnit(id: string) {
  await connectDB();
  return Unit.findById(id)
    .populate('parentUnit')
    .populate('children')
    .populate('memoryPieces')
    .populate('subject');
}

export async function parentUnitChain(id: string) {
  await connectDB();
  let unit = await Unit.findById(id);
  const res = [];
  while (unit != null) {
    res.push(unit);
    unit = await Unit.findById(unit.parentUnit);
  }
  return res;
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

// Check existence or create unit
export async function findOrCreateUnit(unit: CreateUnitInput) {
  try {
    if (unit.imageUrl && !validateImagePath(unit.imageUrl)) {
      throw new Error(`Image file not found: ${unit.imageUrl}`);
    }

    // Unit is uniquely defined by the combination of [title, parentUnit, subject]
    const record = await Unit.findOneAndUpdate(
      { title: unit.title, parentUnit: unit.parentUnit, subject: unit.subject },
      unit,
      { upsert: true, new: true }
    );
    
    console.log('Unit found or created:', record);
    return record;
  } catch (error) {
    console.error('Error in findOrCreateUnit:', error);
    throw error;
  }
}

export async function getDirectChildrenBySubject(subjectId: string) {
  await connectDB();
  return Unit.find({ 
    subject: subjectId,
    parentUnit: null // Only get units without a parentUnit (direct children)
  })
    .sort({ order: 1 })
    .populate('children');
}