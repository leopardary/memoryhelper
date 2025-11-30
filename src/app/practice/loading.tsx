import { TableSkeleton } from '@/app/components/PageLoader';

export default function PracticeLoading() {
  return (
    <div className="flex flex-col items-center px-4 py-8 w-full">
      <div className="w-full max-w-6xl">
        <TableSkeleton />
      </div>
    </div>
  );
}
