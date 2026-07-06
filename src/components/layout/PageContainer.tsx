'use client';

import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function PageContainer({ children, className, title, subtitle }: PageContainerProps) {
  return (
    <main className={cn('max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6', className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
