export default function PerformanceLoading() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-7xl px-4 py-8">
        <div className="space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="h-8 bg-muted-foreground/10 rounded w-64"></div>

          {/* Filter controls skeleton */}
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-muted-foreground/10 rounded w-32"></div>
            <div className="h-10 bg-muted-foreground/10 rounded w-32"></div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-lg p-6 space-y-2">
                <div className="h-4 bg-muted-foreground/10 rounded w-24"></div>
                <div className="h-8 bg-muted-foreground/10 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="bg-muted rounded-lg p-6">
            <div className="h-64 bg-muted-foreground/10 rounded"></div>
          </div>

          {/* Recent activity skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-muted-foreground/10 rounded w-48"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-center p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 bg-muted-foreground/10 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted-foreground/10 rounded w-3/4"></div>
                  <div className="h-3 bg-muted-foreground/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
