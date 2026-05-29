declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    auth: {
      signInAnonymously(): Promise<{ data: { user: { id: string } | null }; error: unknown }>;
      signOut(): Promise<{ error: unknown }>;
      getUser(): Promise<{ data: { user: { id: string } | null } }>;
    };
    from(table: string): any;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseAnonKey: string,
    options?: unknown,
  ): SupabaseClient;
}
