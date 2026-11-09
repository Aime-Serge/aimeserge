import { createClient } from '@supabase/supabase-js';

/**
 * Creates a server-side Supabase client with credentials from environment
 * Falls back to placeholder during build-time static generation if credentials are missing
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY: API key (prefer service role for server)
 */
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Use service role key for server (has elevated permissions)
  // Fall back to anon key if service role not available
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;

  // During build-time static generation, credentials may not be available
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('🔴 CRITICAL: Supabase credentials missing in production! Database operations will fail.');
      console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    } else {
      console.warn(
        '⚠️ Supabase credentials missing. Using placeholder for build-time safety.\n' +
        '   This is OK during static generation, but add .env.local for database queries to work.\n' +
        '   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    // Return a placeholder client that won't crash the build
    // This allows SSG to complete even without DB credentials
    // Fail fast instead of waiting ~60 s per query for a placeholder host to time out.
    // Callers catch the error and use their fallback content.
    return createClient('https://placeholder.supabase.co', 'placeholder-key-for-build-safety', {
      global: { fetch: () => Promise.reject(new Error('Supabase is not configured (missing env vars)')) },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // Prefer service role key (server-side operations)
  const keyType = supabaseServiceKey ? 'service role' : 'anon';
  if (process.env.NODE_ENV === 'development') console.log(`✅ Supabase client initialized with ${keyType} key`);

  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Read-only client for PUBLIC pages. Uses the anon key, so Row-Level Security
 * decides what visitors may see (e.g. drafts stay hidden at the database level).
 * Admin writes keep using createServerSupabaseClient() (service role).
 */
export const createPublicSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    // Missing anon key: fall back to the server client (also handles "no credentials at all").
    return createServerSupabaseClient();
  }
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
