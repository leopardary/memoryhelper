import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/utils/authOptions';
import { redirect } from 'next/navigation';
import ProfileForm from '@/app/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <ProfileForm />
    </div>
  );
}
