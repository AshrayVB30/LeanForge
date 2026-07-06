'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded-lg bg-slate-800 animate-pulse',
              i === lines - 1 && 'w-3/4',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-4 rounded-lg bg-slate-800 animate-pulse',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton lines={2} />
    </div>
  );
}
