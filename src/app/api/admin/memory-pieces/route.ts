import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { updateMemoryPiece, deleteMemoryPiece } from '@/lib/db/api/memory-piece';

// PUT - Update memory piece
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, subjectId, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Memory piece ID is required' },
        { status: 400 }
      );
    }

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const canManage = await hasPermission(session.user.id, 'manage_content', subjectId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedMemoryPiece = await updateMemoryPiece(id, data);

    if (!updatedMemoryPiece) {
      return NextResponse.json(
        { error: 'Memory piece not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memoryPiece: updatedMemoryPiece });
  } catch (error) {
    console.error('Update memory piece error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update memory piece', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete memory piece
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const subjectId = searchParams.get('subjectId');

    if (!id) {
      return NextResponse.json(
        { error: 'Memory piece ID is required' },
        { status: 400 }
      );
    }

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const canManage = await hasPermission(session.user.id, 'manage_content', subjectId);
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteMemoryPiece(id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Delete memory piece error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete memory piece', details: errorMessage },
      { status: 500 }
    );
  }
}
