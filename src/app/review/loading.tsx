import { CardSkeleton } from '@/app/components/PageLoader';

export default function ReviewLoading() {
  return (
    <div className="flex flex-col items-center">
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full max-w-7xl px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
