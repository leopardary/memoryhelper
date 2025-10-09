# Role-Based Access Control (RBAC) Guide

## Overview

This app implements a subject-scoped RBAC system with 4 role levels and 6 permission types.

## Roles

### 1. Visitor (Global)
- **Permissions**: `view`
- **Scope**: Global
- **Description**: Default role for all users. Can only view content.

### 2. Student (Subject-scoped)
- **Permissions**: `view`, `practice`
- **Scope**: Assigned per subject
- **Description**: Can view content and access practice/self-check features within assigned subjects.

### 3. Teacher (Subject-scoped)
- **Permissions**: `view`, `manage_content`, `manage_student`
- **Scope**: Assigned per subject
- **Description**: Can manage content (memory pieces, units) and assign student roles within assigned subjects.

### 4. Administrator (Global)
- **Permissions**: All (`view`, `practice`, `manage_content`, `manage_student`, `manage_subject`, `manage_teacher`)
- **Scope**: Global
- **Description**: Full access to all features and subjects across the entire app.

## Permissions

| Permission | Description |
|------------|-------------|
| `view` | View memory pieces, subjects, and units |
| `practice` | Access practice and self-check features |
| `manage_content` | Create/edit/delete memory pieces and units |
| `manage_student` | Assign student roles to users |
| `manage_subject` | Create/edit/delete subjects |
| `manage_teacher` | Assign teacher roles to users |

## Setup Instructions

### 1. Seed Default Roles

Run the seeding script to create the default roles in your database:

```bash
npm run seed:roles
```

This creates the 4 default roles with their respective permissions.

### 2. Assign Administrator Role

To assign the first administrator (yourself), use the make-admin script:

```bash
npm run make-admin your-email@example.com
```

**Important**: Make sure you've signed up in the app first. The script will look up the user by email and assign the administrator role.

### 3. Access Role Management UI

Once you're an administrator, navigate to:

```
http://localhost:3000/admin/roles
```

Here you can:
- Assign roles to users
- Assign subject-specific roles (student/teacher)
- View all role definitions
- Remove role assignments

## Usage Examples

### Check Permission in Server Component

```typescript
import { hasPermission } from '@/lib/utils/permissions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';

export default async function MyPage({ params }: { params: { subjectId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Check if user can manage content in this subject
  const canManage = await hasPermission(userId, 'manage_content', params.subjectId);

  if (!canManage) {
    return <div>You don't have permission to manage content</div>;
  }

  return <div>Content management UI</div>;
}
```

### Check Permission in API Route

```typescript
import { hasPermission } from '@/lib/utils/permissions';
import { getServerSession } from 'next-auth/next';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { subjectId } = await request.json();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canManage = await hasPermission(
    session.user.id,
    'manage_content',
    subjectId
  );

  if (!canManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Proceed with content management
}
```

### Check if User is Administrator

```typescript
import { isAdministrator } from '@/lib/utils/permissions';

const isAdmin = await isAdministrator(userId);

if (isAdmin) {
  // Show admin features
}
```

### Get All User Permissions

```typescript
import { getUserPermissions } from '@/lib/utils/permissions';

// Get global permissions
const globalPermissions = await getUserPermissions(userId);

// Get permissions for a specific subject
const subjectPermissions = await getUserPermissions(userId, subjectId);
```

### Use Permissions from Session (Client-side)

```typescript
'use client'
import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session } = useSession();

  const canPractice = session?.user?.permissions?.includes('practice');
  const isAdmin = session?.user?.isAdmin;

  return (
    <div>
      {canPractice && <PracticeButton />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

## Typical Workflows

### Making a User a Teacher for a Subject

1. Go to `/admin/roles`
2. Select the user
3. Select "Teacher" role
4. Select the subject
5. Click "Assign Role"

### Making a User a Student for Multiple Subjects

Repeat the assignment process for each subject:
1. Select user
2. Select "Student" role
3. Select subject A → Assign
4. Select subject B → Assign
5. Etc.

### Promoting a Teacher to Administrator

1. Go to `/admin/roles`
2. Select the user
3. Select "Administrator" role
4. No subject selection needed (it's global)
5. Click "Assign Role"

## Database Schema

### Role Collection
```typescript
{
  _id: ObjectId,
  name: 'visitor' | 'student' | 'teacher' | 'administrator',
  displayName: string,
  description: string,
  globalPermissions: Permission[],
  isGlobal: boolean
}
```

### UserRole Collection (Junction Table)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,  // ref: User
  roleId: ObjectId,  // ref: Role
  subjectId: ObjectId | null,  // ref: Subject, null for global roles
  createdAt: Date
}
```

### Updated User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  defaultRole: 'visitor' | 'student' | 'teacher' | 'administrator',
  // ... other fields
}
```

## Helper Functions Reference

### Permission Checking
- `hasPermission(userId, permission, subjectId?)` - Check single permission
- `hasAnyPermission(userId, permissions[], subjectId?)` - Check if user has ANY of the permissions
- `hasAllPermissions(userId, permissions[], subjectId?)` - Check if user has ALL permissions
- `getUserPermissions(userId, subjectId?)` - Get all permissions for user
- `isAdministrator(userId)` - Check if user is global administrator

### Role Management
- `assignUserRole(data)` - Assign role to user
- `removeUserRole(id)` - Remove role assignment
- `getUserRoles(userId)` - Get all roles for user
- `getUserRolesBySubject(userId, subjectId)` - Get roles for specific subject
- `getGlobalUserRoles(userId)` - Get global roles only

### Role Queries
- `getRoleByName(name)` - Get role by name
- `getAllRoles()` - Get all defined roles
- `getSubjectsWithRole(userId, roleName)` - Get subjects where user has specific role

## Notes

- **Global vs Subject-scoped**: Visitor and Administrator are always global. Student and Teacher are always subject-scoped.
- **Permission Hierarchy**: Administrator bypasses all permission checks
- **Default Role**: All new users get 'visitor' as their default role
- **Session Integration**: User permissions are loaded into the session for quick client-side checks
