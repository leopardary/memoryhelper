'use server'
import Unit from '@/lib/db/model/Unit';
import { getSubject } from '@/lib/db/api/subject';
import { connectDB } from '@/lib/db/utils';
import { CreateUnitInput, UpdateUnitInput, UnitType } from '@/lib/db/model/types/Unit.types';
import { revalidatePath } from 'next/cache'

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
    if (!unit.imageUrls) {
      throw new Error(`Image file not found: ${unit.imageUrls}`);
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

interface UnitBaseProps {
  title: string,
  description: string,
  imageUrls: string[]
}

export interface AddSubUnitProps extends UnitBaseProps {
  parentUnitId: string
  type?: UnitType
}

function getDefaultTypeForSubUnit(parentType: string): UnitType {
  if (parentType === 'module') return 'chapter';
  if (parentType === 'chapter') return 'lesson';
  return 'module'; // for 'lesson' or any other case
}

/**
 * To add subUnit based on the passed in props.
 */
export async function addSubUnit(props: AddSubUnitProps) {
  const {parentUnitId, title, description, imageUrls, type} = props;
  try {
    if (!imageUrls) {
      throw new Error(`Image file not found: ${imageUrls}`);
    }
    const parentUnit = await getUnit(parentUnitId);
    if (parentUnit == null) {
      throw new Error("Parent Unit not found.");
    }

    // Calculate default type based on parent if not provided
    const unitType = type || getDefaultTypeForSubUnit(parentUnit.type);

    const siblingUnits = await Unit.find({ parentUnit: parentUnit });
    const existingOrderIndices = siblingUnits.map(unit => (unit.order || 0));
    const order = Math.max(...existingOrderIndices) + 1;
    // Unit is uniquely defined by the combination of [title, parentUnit, subject]
    const record = await Unit.findOneAndUpdate(
      { title: title, parentUnit: parentUnit, subject: parentUnit.subject },
      { title: title, parentUnit: parentUnit, subject: parentUnit.subject, description, imageUrls, order, type: unitType },
      { upsert: true, new: true }
    );
    revalidatePath(`/unit/${parentUnitId}`);
    console.log('Unit found or created:', record);
    return record.title;
  } catch (error) {
    console.error('Error in findOrCreateUnit:', error);
    throw error;
  }
}

export interface AddRootUnitProps extends UnitBaseProps {
  subjectId: string,
  type?: UnitType,
}

export async function addRootUnitForSubject(props: AddRootUnitProps) {
  const {subjectId, title, description, imageUrls, type = 'module' as UnitType} = props;
  try {
    if (!imageUrls) {
      throw new Error(`Image file not found: ${imageUrls}`);
    }
    const subject = await getSubject(subjectId);
    if (subject == null) {
      throw new Error("Subject not found.");
    }
    const siblingUnits = await getDirectChildrenBySubject(subjectId);
    const existingOrderIndices = siblingUnits.map(unit => (unit.order || 0));
    const order = Math.max(...existingOrderIndices) + 1;
    // Unit is uniquely defined by the combination of [title, parentUnit, subject]
    const record = await Unit.findOneAndUpdate(
      { title: title, subject: subject },
      { title: title, subject: subject, description, imageUrls, order, type },
      { upsert: true, new: true }
    );
    revalidatePath(`/subject/${subjectId}`);
    console.log('Unit found or created:', record);
    return record.title;
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