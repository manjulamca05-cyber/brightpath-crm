// ==============================================================================
// BrightPath CRM — Supabase Client Singleton & Environment Validator
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are set and not just template placeholder text
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  const isPlaceholderUrl = supabaseUrl.includes('your-project-id') || !supabaseUrl.startsWith('https://');
  const isPlaceholderKey = supabaseAnonKey.includes('your-anon-public-key') || supabaseAnonKey.length < 20;
  return !isPlaceholderUrl && !isPlaceholderKey;
};

// Safe client initializer: returns real client if configured, otherwise a safe fallback client
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface HealthCheckResult {
  ok: boolean;
  message: string;
  leadCount?: number;
  error?: string;
}

// Runtime connectivity probe: queries public.leads to test API connection
export const checkSupabaseConnection = async (): Promise<HealthCheckResult> => {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or set to placeholder values.',
    };
  }

  try {
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        ok: false,
        message: `Database query returned an error: ${error.message}`,
        error: error.message,
      };
    }

    return {
      ok: true,
      message: 'Connected to Supabase PostgreSQL successfully!',
      leadCount: count ?? 0,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Failed to reach Supabase: ${errorMessage}`,
      error: errorMessage,
    };
  }
};
