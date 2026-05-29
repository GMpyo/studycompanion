import { getOptionalSupabase } from '../supabase/client';
import { UserProfile } from '../social/types';

export class AuthService {
  static async signInAnonymously(): Promise<{ user: any | null; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) {
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      // Ensure profile exists after sign in
      if (data?.user) {
        await this.ensureProfileExists(data.user.id, `User_${data.user.id.substring(0, 5)}`);
      }
      
      return { user: data.user, error };
    } catch (e) {
      return { user: null, error: e };
    }
  }

  static async signOut(): Promise<{ error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) {
      return { error: null }; // Consider it a success if not configured
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (e) {
      return { error: e };
    }
  }

  static async getCurrentUser(): Promise<any | null> {
    const supabase = getOptionalSupabase();
    if (!supabase) return null;

    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (e) {
      console.warn('Failed to get current user:', e);
      return null;
    }
  }

  static async ensureProfileExists(userId: string, defaultName: string): Promise<void> {
    const supabase = getOptionalSupabase();
    if (!supabase) return;

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        await supabase.from('profiles').insert([
          { id: userId, display_name: defaultName }
        ]);
      }
    } catch (error) {
      console.warn('Failed to ensure profile exists:', error);
    }
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getOptionalSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, active_character_id, total_xp, created_at')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        displayName: data.display_name,
        activeCharacterId: data.active_character_id,
        totalXp: data.total_xp,
        createdAt: data.created_at,
      };
    } catch (e) {
      return null;
    }
  }
}
