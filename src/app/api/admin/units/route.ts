import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { updateUnit, deleteUnit, getUnit } from '@/lib/db/api/unit';

// PUT - Update unit
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Unit ID is required' },
        { status: 400 }
      );
    }

    // Get the unit to find its subject
    const unit = await getUnit(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    const canManage = await hasPermission(session.user.id, 'manage_content', unit.subject.id.toString());
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedUnit = await updateUnit(id, data);

    if (!updatedUnit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ unit: updatedUnit });
  } catch (error) {
    console.error('Update unit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update unit', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete unit
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Unit ID is required' },
        { status: 400 }
      );
    }

    // Get the unit to find its subject
    const unit = await getUnit(id);
    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    const canManage = await hasPermission(session.user.id, 'manage_content', unit.subject.id.toString());
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteUnit(id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Delete unit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete unit', details: errorMessage },
      { status: 500 }
    );
  }
}
