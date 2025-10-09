import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { isAdministrator } from '@/lib/utils/permissions';
import { redirect } from 'next/navigation';
import RoleManagement from './RoleManagement';
import { getUsers } from '@/lib/db/api/user';
import { getAllRoles } from '@/lib/db/api/role';
import Subject from '@/lib/db/model/Subject';
import { connectDB } from '@/lib/db/utils';

async function getSubjectsForRoleManagement() {
  await connectDB();
  // Get subjects without populating units (we only need id and title)
  return Subject.find().select('_id title').lean();
}

export default async function AdminRolesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const isAdmin = await isAdministrator(session.user.id);

  if (!isAdmin) {
    redirect('/');
  }

  const users = await getUsers();
  const roles = await getAllRoles();
  const subjects = await getSubjectsForRoleManagement();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>
      <p className="text-muted-foreground mb-8">
        Assign roles to users for global access or specific subjects
      </p>

      <RoleManagement
        usersData={JSON.stringify(users)}
        rolesData={JSON.stringify(roles)}
        subjectsData={JSON.stringify(subjects)}
      />
    </div>
  );
}
