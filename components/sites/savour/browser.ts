'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readSavourEnv } from './env';

let cached: SupabaseClient | null = null;

/** One client per tab. The anonymous session persists in localStorage under savour-auth. */
export function getSavourClient(): SupabaseClient | null {
  if (cached) return cached;
  const env = readSavourEnv();
  if (!env) return null;
  cached = createClient(env.url, env.key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'savour-auth' },
  });
  return cached;
}
