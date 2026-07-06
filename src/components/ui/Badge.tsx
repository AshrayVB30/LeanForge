'use client';

import { cn } from '@/lib/utils';
import { getRoutineBgColor, getRoutineColor } from '@/lib/ppl';
import type { RoutineType } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'routine';
  routine?: RoutineType;
}

export function Badge({ children, className, variant = 'default', routine }: BadgeProps) {
  if (variant === 'routine' && routine) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
          getRoutineBgColor(routine),
          getRoutineColor(routine),
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        className
      )}
    >
      {children}
    </span>
  );
}
