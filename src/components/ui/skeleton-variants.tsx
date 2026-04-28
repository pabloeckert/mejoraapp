import { Card, CardContent } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {/* Header */}
          <div className="flex gap-4 p-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 flex-1 bg-muted animate-pulse rounded" />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex gap-4 p-4">
              {Array.from({ length: cols }).map((_, col) => (
                <div key={col} className="h-3 flex-1 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonKPI({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-10 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-4" />
        <div className="h-[250px] bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
