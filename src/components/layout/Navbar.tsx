'use client';

// ============================================================
// LeanForge — Top Navigation Bar
// ============================================================

import { useAuth } from '@/providers/AuthProvider';
import { Dumbbell, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              Lean<span className="text-emerald-400">Forge</span>
            </span>
            <p className="text-[10px] text-slate-500 -mt-1 hidden sm:block">
              Track the Surplus. Forge the Muscle.
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/workout', label: 'Workout' },
            { href: '/nutrition', label: 'Nutrition' },
            { href: '/analytics', label: 'Analytics' },
            { href: '/community', label: 'Community' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <User className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
