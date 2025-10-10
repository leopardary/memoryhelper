import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { addMemoryPieceToUnit } from '@/lib/db/api/memory-piece';
import { getUnit } from '@/lib/db/api/unit';

// POST - Add memory piece to unit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { unitId, content, imageUrls, description, descriptionFunc, labels } = body;

    if (!unitId) {
      return NextResponse.json(
        { error: 'Unit ID is required' },
        { status: 400 }
      );
    }

    // Get unit to find subject
    const unit = await getUnit(unitId);
    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    const subjectId = unit.subject.id.toString();
    const canManage = await hasPermission(session.user.id, 'manage_content', subjectId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await addMemoryPieceToUnit({
      unitId,
      content,
      imageUrls,
      description,
      descriptionFunc,
      labels
    });

    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Add memory piece error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add memory piece', details: errorMessage },
      { status: 500 }
    );
  }
}
