import Spinner from './Spinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-muted rounded-lg p-6 space-y-4">
      <div className="h-48 bg-muted-foreground/10 rounded"></div>
      <div className="h-4 bg-muted-foreground/10 rounded w-3/4"></div>
      <div className="h-4 bg-muted-foreground/10 rounded w-1/2"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse w-full">
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted p-4 border-b">
          <div className="h-4 bg-muted-foreground/10 rounded w-full"></div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 bg-muted-foreground/10 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/10 rounded w-3/4"></div>
                <div className="h-3 bg-muted-foreground/10 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-2xl">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted-foreground/10 rounded w-24"></div>
          <div className="h-10 bg-muted-foreground/10 rounded w-full"></div>
        </div>
      ))}
      <div className="flex gap-4 justify-end">
        <div className="h-10 bg-muted-foreground/10 rounded w-24"></div>
        <div className="h-10 bg-muted-foreground/10 rounded w-24"></div>
      </div>
    </div>
  );
}
