// ==============================================================================
// BrightPath CRM — Authentication Service Layer
// Integrates with Supabase Auth (GoTrue) and PostgreSQL profiles table
// ==============================================================================

import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/database';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  error?: string;
}

export const authService = {
  /**
   * Authenticate user with Email and Password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, session: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, session: null, profile: null, error: 'User object missing after login.' };
      }

      const profile = await this.getOrCreateProfile(data.user);

      return {
        user: data.user,
        session: data.session,
        profile,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign in.';
      return { user: null, session: null, profile: null, error: message };
    }
  },

  /**
   * Register a new user account with default 'counsellor' role
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { user: null, session: null, profile: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, session: null, profile: null, error: 'User registration failed.' };
      }

      // If email confirmation is disabled in Supabase, session is returned immediately
      let profile: Profile | null = null;
      if (data.session) {
        profile = await this.getOrCreateProfile(data.user, fullName);
      }

      return {
        user: data.user,
        session: data.session,
        profile,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      return { user: null, session: null, profile: null, error: message };
    }
  },

  /**
   * Sign out current user and clear local session
   */
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error signing out.';
      return { error: message };
    }
  },

  /**
   * Fetch current active session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  /**
   * Fetch or auto-hydrate profile row from public.profiles
   */
  async getOrCreateProfile(user: User, fallbackName?: string): Promise<Profile | null> {
    try {
      // 1. Attempt to fetch profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        return data as Profile;
      }

      // 2. If profile is missing (e.g. trigger didn't run or email confirmation delay), insert default row
      const name = fallbackName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member';
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: name,
          role: 'counsellor',
        })
        .select('*')
        .single();

      if (!insertError && inserted) {
        return inserted as Profile;
      }

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to auth state transitions (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
   */
  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null);
    });
  },
};
