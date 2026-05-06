/**
 * PageLoadingSkeleton — Consistent loading state for lazy-loaded routes
 */

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="h-8 w-28 bg-muted rounded" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-muted rounded-full" />
            <div className="h-9 w-9 bg-muted rounded-full" />
            <div className="h-9 w-9 bg-muted rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
        </div>
        <div className="h-32 w-full bg-muted rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>

      {/* Bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-5 bg-muted rounded" />
              <div className="h-3 w-10 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
