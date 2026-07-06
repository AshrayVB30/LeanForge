'use client';

// ============================================================
// LeanForge — Mobile Bottom Navigation
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  BarChart3,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/community', label: 'Community', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-all',
                    isActive && 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  )}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
