import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Supabase URL or Anon Key is missing. Running in offline/local-only mode.');
}

/**
 * Returns the Supabase client if initialized, otherwise throws an error.
 * Use this for operations that strictly require Supabase to be configured.
 */
export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your environment variables.');
  }
  return supabase;
};

/**
 * Returns the Supabase client if initialized, otherwise null.
 * Use this for optional operations where local fallback is acceptable.
 */
export const getOptionalSupabase = (): SupabaseClient | null => {
  return supabase;
};
