import { getOptionalSupabase } from './client';
import { AuthService } from '../auth/authService';
import { CloudSavePayload } from '../social/types';

export class SyncService {
  /**
   * Upload local AppData to Supabase cloud_saves table
   */
  static async uploadSave(appData: any, version: number): Promise<{ success: boolean; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { success: false, error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { success: false, error: new Error('Not logged in') };

      const { error } = await supabase
        .from('cloud_saves')
        .upsert({
          user_id: user.id,
          app_data_version: version,
          app_data: appData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      // Update profile XP and active character if we can glean it from appData
      try {
        const activeCharacterId = appData?.activeCharacterId || null;
        let totalXp = 0;
        if (appData?.characters) {
          totalXp = Object.values(appData.characters).reduce((sum: number, char: any) => sum + (char.xp || 0), 0);
        }
        
        await supabase
          .from('profiles')
          .update({
            active_character_id: activeCharacterId,
            total_xp: totalXp
          })
          .eq('id', user.id);
      } catch (profileErr) {
        console.warn('Failed to update profile stats during sync:', profileErr);
      }

      return { success: !error, error };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Download the latest cloud save from Supabase
   */
  static async downloadSave(): Promise<{ save: CloudSavePayload | null; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { save: null, error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { save: null, error: new Error('Not logged in') };

      const { data, error } = await supabase
        .from('cloud_saves')
        .select('app_data_version, app_data, updated_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
        return { save: null, error };
      }

      if (!data) return { save: null, error: null };

      return {
        save: {
          appDataVersion: data.app_data_version,
          appData: data.app_data,
          updatedAt: data.updated_at
        },
        error: null
      };
    } catch (e) {
      return { save: null, error: e };
    }
  }
}
