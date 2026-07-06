'use client';

// ============================================================
// Client Layout — shows Navbar/BottomNav on authenticated pages
// ============================================================

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/providers/AuthProvider';
import { Dumbbell } from 'lucide-react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';
  const isOnboardingPage = pathname === '/onboarding';
  const isStandalonePage = isLoginPage || isLandingPage || isOnboardingPage;

  // Auth & Onboarding Protection
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Unauthenticated: only allow access to standalone pages
      if (!isStandalonePage) {
        router.push('/login');
      }
    } else if (profile) {
      // Authenticated with a loaded profile
      if (!profile.is_onboarded && !isOnboardingPage && !isLandingPage) {
        // Logged in but not onboarded -> force onboarding
        router.push('/onboarding');
      } else if (profile.is_onboarded && isOnboardingPage) {
        // Already onboarded -> skip onboarding
        router.push('/dashboard');
      } else if (isLoginPage) {
        // Logged in -> shouldn't see login page
        router.push('/dashboard');
      }
    }
  }, [loading, user, profile, isOnboardingPage, isLandingPage, isLoginPage, isStandalonePage, router]);

  // Humanized Splash Screen while loading initial state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <div className="w-16 h-16 bg-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center relative shadow-2xl shadow-emerald-500/20 animate-bounce">
            <Dumbbell className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-bold text-white tracking-tight animate-pulse">
          LeanForge
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">
          Warming up...
        </p>
      </div>
    );
  }

  if (isStandalonePage) {
    return <div className="animate-in fade-in duration-500 h-full">{children}</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 flex flex-col min-h-full">
      <Navbar />
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
