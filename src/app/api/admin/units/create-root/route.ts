import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { addRootUnitForSubject } from '@/lib/db/api/unit';

// POST - Create root unit for subject
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectId, title, description, imageUrls } = body;

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

    const result = await addRootUnitForSubject({ subjectId, title, description, imageUrls });

    return NextResponse.json({ title: result });
  } catch (error) {
    console.error('Create root unit error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create root unit', details: errorMessage },
      { status: 500 }
    );
  }
}
