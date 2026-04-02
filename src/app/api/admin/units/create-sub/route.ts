import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { addSubUnit, getUnit } from '@/lib/db/api/unit';
import { UnitType } from '@/lib/db/model/types/Unit.types';

const VALID_UNIT_TYPES: ReadonlyArray<UnitType> = ['module', 'chapter', 'lesson'];

// POST - Create sub unit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parentUnitId, title, description, imageUrls, type } = body;

    if (!parentUnitId) {
      return NextResponse.json(
        { error: 'Parent unit ID is required' },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (type && !VALID_UNIT_TYPES.includes(type as UnitType)) {
      return NextResponse.json(
        { error: 'Invalid unit type. Must be one of: module, chapter, lesson' },
        { status: 400 }
      );
    }

    // Get parent unit to find subject
    const parentUnit = await getUnit(parentUnitId);
    if (!parentUnit) {
      return NextResponse.json(
        { error: 'Parent unit not found' },
        { status: 404 }
      );
    }

    const subjectId = parentUnit.subject.id.toString();
    const canManage = await hasPermission(session.user.id, 'manage_content', subjectId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await addSubUnit({ parentUnitId, title, description, imageUrls, type });

    return NextResponse.json({ title: result });
  } catch (error) {
    console.error('Create sub unit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create sub unit', details: errorMessage },
      { status: 500 }
    );
  }
}
