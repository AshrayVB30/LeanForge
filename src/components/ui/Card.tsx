'use client';

import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const base = 'rounded-2xl transition-all duration-300';

    const variants = {
      default: 'bg-slate-900/80 border border-slate-800',
      glass:
        'bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-xl shadow-black/20',
      bordered: 'bg-slate-900/60 border-2 border-slate-700',
    };

    const hoverEffect = hover
      ? 'hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-lg cursor-pointer hover:-translate-y-0.5'
      : '';

    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], hoverEffect, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 pt-5 pb-2', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props} />
  );
}

export { Card, CardHeader, CardContent };
