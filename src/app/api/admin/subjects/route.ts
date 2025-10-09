import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { updateSubject } from '@/lib/db/api/subject';

// PUT - Update subject
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canManage = await hasPermission(session.user.id, 'manage_subject');
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const updatedSubject = await updateSubject(id, data);

    if (!updatedSubject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subject: updatedSubject });
  } catch (error) {
    console.error('Update subject error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update subject', details: errorMessage },
      { status: 500 }
    );
  }
}
