"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
}

function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-surface-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton components for common use cases
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
      <Skeleton className="h-48 w-full" variant="rectangular" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" variant="rounded" />
        <Skeleton className="h-3 w-full" variant="rounded" />
        <Skeleton className="h-3 w-2/3" variant="rounded" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-20" variant="rounded" />
          <Skeleton className="h-8 w-24" variant="rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" variant="rounded" />
            <Skeleton className="h-3 w-2/3" variant="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList };
