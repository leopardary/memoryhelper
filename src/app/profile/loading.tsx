import { FormSkeleton } from '@/app/components/PageLoader';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="h-9 bg-muted-foreground/10 rounded w-48 animate-pulse"></div>
      </div>
      <FormSkeleton />
    </div>
  );
}
