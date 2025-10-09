import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { redirect } from 'next/navigation';
import { findOrCreateSubject } from '@/lib/db/api/subject';
import AddSubjectModal from '@/app/components/AddSubjectModal';

export default async function AdminSubjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const canManage = await hasPermission(session.user.id, 'manage_subject');

  if (!canManage) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage Subjects</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage subjects in the application
      </p>

      <div className="flex justify-center">
        <AddSubjectModal findOrCreateSubject={findOrCreateSubject} />
      </div>
    </div>
  );
}
