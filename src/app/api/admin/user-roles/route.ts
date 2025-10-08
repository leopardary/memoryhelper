import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { isAdministrator } from '@/lib/utils/permissions';
import { assignUserRole, removeUserRole, getUserRoles } from '@/lib/db/api/user-role';
import { getAllRoles } from '@/lib/db/api/role';
import { getUsers } from '@/lib/db/api/user';

// GET - Get all user role assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdministrator(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (userId) {
      const userRoles = await getUserRoles(userId);
      return NextResponse.json({ userRoles });
    }

    // Get all users with their roles
    const users = await getUsers();
    const roles = await getAllRoles();

    return NextResponse.json({ users, roles });
  } catch (error) {
    console.error('Get user roles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
      { status: 500 }
    );
  }
}

// POST - Assign role to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdministrator(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, roleId, subjectId } = body;

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'userId and roleId are required' },
        { status: 400 }
      );
    }

    const userRole = await assignUserRole({
      userId,
      roleId,
      subjectId: subjectId || null
    });

    return NextResponse.json({ userRole }, { status: 201 });
  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// DELETE - Remove role from user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdministrator(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userRoleId = searchParams.get('id');

    if (!userRoleId) {
      return NextResponse.json(
        { error: 'UserRole ID is required' },
        { status: 400 }
      );
    }

    await removeUserRole(userRoleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove role error:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}
