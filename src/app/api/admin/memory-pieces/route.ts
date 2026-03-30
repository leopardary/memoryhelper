import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { updateMemoryPiece, deleteMemoryPiece, removeMemoryPieceFromUnit, getMemoryPiece } from '@/lib/db/api/memory-piece';
import { getUnit } from '@/lib/db/api/unit';

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

// DELETE - Delete memory piece or unlink from unit
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const subjectId = searchParams.get('subjectId');
    const unitId = searchParams.get('unitId');

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

    // If unitId provided, unlink from unit; otherwise full delete
    if (unitId) {
      // Validate unit-subject relationship
      const unit = await getUnit(unitId);
      if (!unit) {
        return NextResponse.json(
          { error: 'Unit not found' },
          { status: 404 }
        );
      }
      if (unit.subject.toString() !== subjectId) {
        return NextResponse.json(
          { error: 'Unit does not belong to specified subject' },
          { status: 400 }
        );
      }

      const result = await removeMemoryPieceFromUnit(id, unitId);

      if (!result.success) {
        // Handle different failure statuses
        if (result.status === 'not_found') {
          return NextResponse.json(
            { error: 'Memory piece not found' },
            { status: 404 }
          );
        } else if (result.status === 'not_linked') {
          return NextResponse.json(
            { error: 'Memory piece is not linked to this unit' },
            { status: 400 }
          );
        } else {
          // status === 'error'
          return NextResponse.json(
            { error: 'Failed to unlink memory piece' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        id,
        status: result.status,
        message: result.status === 'orphaned'
          ? 'Memory piece unlinked. It is not linked to any other units.'
          : 'Memory piece unlinked from unit successfully.'
      });
    } else {
      // Full delete (for orphaned pieces)
      // Validate memory piece belongs to subject
      const memoryPiece = await getMemoryPiece(id);
      if (!memoryPiece) {
        return NextResponse.json(
          { error: 'Memory piece not found' },
          { status: 404 }
        );
      }

      // Check if memory piece is orphaned (no units)
      if (!memoryPiece.units || memoryPiece.units.length === 0) {
        // For orphaned pieces, allow deletion
        // User already has manage_content permission on the subjectId
        await deleteMemoryPiece(id);
        return NextResponse.json({
          success: true,
          id,
          status: 'deleted',
          message: 'Orphaned memory piece deleted completely'
        });
      }

      // For non-orphaned pieces, validate subject relationship
      // Use single query for better performance instead of N+1 queries
      const Unit = (await import('@/lib/db/model/Unit')).default;
      const unitIds = memoryPiece.units.map((id: any) => id.toString());
      const unitWithSubject = await Unit.findOne({
        _id: { $in: unitIds },
        subject: subjectId
      });

      if (!unitWithSubject) {
        return NextResponse.json(
          { error: 'Memory piece does not belong to specified subject' },
          { status: 400 }
        );
      }

      await deleteMemoryPiece(id);
      return NextResponse.json({
        success: true,
        id,
        status: 'deleted',
        message: 'Memory piece deleted completely'
      });
    }
  } catch (error) {
    console.error('Delete/unlink memory piece error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete/unlink memory piece', details: errorMessage },
      { status: 500 }
    );
  }
}
