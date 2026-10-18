// ==============================================================================
// BrightPath CRM — Authentication & Role Context Provider
// ==============================================================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../../types/database';
import { authService } from '../../services/authService';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile when user changes
  const loadProfile = useCallback(async (currentUser: User) => {
    try {
      const userProfile = await authService.getOrCreateProfile(currentUser);
      setProfile(userProfile);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session load
    const initializeAuth = async () => {
      try {
        const initialSession = await authService.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await loadProfile(initialSession.user);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Listen to active auth transitions
    const { data: { subscription } } = authService.onAuthStateChange(async (newSession, newUser) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newUser);

      if (newUser) {
        await loadProfile(newUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    if (result.error) {
      setLoading(false);
      return { success: false, error: result.error };
    }
    setUser(result.user);
    setSession(result.session);
    setProfile(result.profile);
    setLoading(false);
    return { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const result = await authService.signUp(email, password, fullName);
    if (result.error) {
      setLoading(false);
      return { success: false, error: result.error };
    }
    if (result.user && result.session) {
      setUser(result.user);
      setSession(result.session);
      setProfile(result.profile);
    }
    setLoading(false);
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  const role: UserRole | null = profile?.role ?? (user ? 'counsellor' : null);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, role, loading, signIn, signUp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
