'use client';

import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500',
              'px-4 py-2.5 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
              'hover:border-slate-600',
              icon ? 'pl-10' : undefined,
              error ? 'border-red-500/50 focus:ring-red-500/50' : undefined,
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
