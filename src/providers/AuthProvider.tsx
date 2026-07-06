'use client';

// ============================================================
// LeanForge — Auth Provider (works with or without Supabase)
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserProfile } from '@/lib/types';
import { getLocalProfile, updateLocalProfile } from '@/lib/storage';

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes('placeholder') &&
    !key.includes('placeholder') &&
    url.startsWith('https://')
  );
}

interface DemoUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: DemoUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured();

  useEffect(() => {
    if (isDemo) {
      // Demo mode: check if there's an active user
      import('@/lib/storage').then(({ getLocalProfile, getActiveUserId, setActiveUserId }) => {
        const activeId = getActiveUserId();
        if (typeof window !== 'undefined' && localStorage.getItem('active_demo_user')) {
          setActiveUserId(activeId);
          const localProfile = getLocalProfile();
          setUser({ id: activeId, email: activeId });
          setProfile(localProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
    } else {
      // Supabase mode
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (data) setProfile(data as UserProfile);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [isDemo]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log("DEMO MODE: Bypassing Supabase and signing in locally");
    const { setActiveUserId, updateLocalProfile } = await import('@/lib/storage');
    setActiveUserId(email);
    // Fetch their specific profile
    const p = updateLocalProfile({ email });
    setUser({ id: p.id, email: p.email });
    setProfile(p);
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { setActiveUserId, updateLocalProfile } = await import('@/lib/storage');
    setActiveUserId(email);
    const p = updateLocalProfile({ email, is_onboarded: false });
    setUser({ id: p.id, email: p.email });
    setProfile(p);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (isDemo) {
      const { setActiveUserId } = await import('@/lib/storage');
      setActiveUserId(null);
    } else {
      const { createClient } = await import('@/lib/supabase/client');
      await createClient().auth.signOut();
    }
    setUser(null);
    setProfile(null);
  }, [isDemo]);

  const updateProfileFn = useCallback(async (updates: Partial<UserProfile>) => {
    const updated = updateLocalProfile(updates);
    setProfile(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        signIn,
        signUp,
        signOut,
        updateProfile: updateProfileFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
