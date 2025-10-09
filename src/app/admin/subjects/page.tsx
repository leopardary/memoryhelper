import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { hasPermission } from '@/lib/utils/permissions';
import { redirect } from 'next/navigation';
import { findOrCreateSubject, deleteSubject } from '@/lib/db/api/subject';
import Subject from '@/lib/db/model/Subject';
import { connectDB } from '@/lib/db/utils';
import SubjectManagement from './SubjectManagement';

async function getSubjectsForManagement() {
  await connectDB();
  // Get subjects without populating units (we only need basic subject info)
  return Subject.find().sort({ createdAt: -1 }).lean();
}

export default async function AdminSubjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const canManage = await hasPermission(session.user.id, 'manage_subject');

  if (!canManage) {
    redirect('/');
  }

  const subjects = await getSubjectsForManagement();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Manage Subjects</h1>
      <p className="text-muted-foreground mb-8">
        Create new subjects and manage existing ones
      </p>

      <SubjectManagement
        subjectsData={JSON.stringify(subjects)}
        findOrCreateSubject={findOrCreateSubject}
        deleteSubject={deleteSubject}
      />
    </div>
  );
}
