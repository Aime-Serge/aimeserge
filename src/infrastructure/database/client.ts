import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that browser-side credentials are available
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    '🔴 ERROR: Supabase environment variables are missing!\n' +
    '   Client-side database features will not work.\n' +
    '   Required environment variables:\n' +
    '   - NEXT_PUBLIC_SUPABASE_URL\n' +
    '   - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
    '   Add these to your .env.local file:\n' +
    '   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
    '   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here'
  );
}

// Create client with fallback for build-time safety
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key-for-build-safety'
);

/**
 * Check if Supabase client has valid credentials
 * Use this before making API calls to verify configuration
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co');
};
