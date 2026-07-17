import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, Role } from '../lib/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signInAdmin: (email: string, password: string) => Promise<Profile>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as Profile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      const uid = data.session?.user?.id;
      if (uid) {
        // IIFE to avoid deadlocking the sync callback
        (async () => {
          await loadProfile(uid);
          setLoading(false);
        })();
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      const uid = sess?.user?.id;
      if (uid) {
        (async () => {
          await loadProfile(uid);
        })();
      } else {
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await loadProfileAndWait(data.user.id);
    // Block admin-role users from the normal user login
    if (profile && (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN')) {
      await supabase.auth.signOut();
      setProfile(null); setUser(null); setSession(null);
      throw new Error('This account cannot sign in here. Please use the correct login page.');
    }
    return profile as Profile;
  };

  const signInAdmin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await loadProfileAndWait(data.user.id);
    // Only SUPER_ADMIN can use the admin login
    if (!profile || profile.role !== 'SUPER_ADMIN') {
      await supabase.auth.signOut();
      setProfile(null); setUser(null); setSession(null);
      throw new Error('Access denied. Super Admin credentials required.');
    }
    return profile as Profile;
  };

  async function loadProfileAndWait(uid: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as Profile | null);
    return data as Profile | null;
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    // Email confirmation is OFF; if a session is returned, use it directly.
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      await loadProfile(data.session.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!user) throw new Error('Not signed in');
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data as Profile);
  };

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'SUPER_ADMIN',
    signIn,
    signInAdmin,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRole(): Role | null {
  return useAuth().profile?.role ?? null;
}
