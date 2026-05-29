import { getOptionalSupabase } from '../supabase/client';
import { AuthService } from '../auth/authService';
import { FriendService } from './friendService';
import { FriendSummary } from './types';

interface WeeklySnapshotRow {
  user_id: string;
  weekly_study_minutes: number;
}

export class RankingService {
  /**
   * Get the start date of the current week (e.g. Monday) in YYYY-MM-DD format
   */
  static getCurrentWeekStartDate(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startOfWeek = new Date(now.setDate(diff));
    return startOfWeek.toISOString().split('T')[0];
  }

  /**
   * Update current user's weekly study minutes
   */
  static async updateWeeklyMinutes(minutes: number): Promise<{ success: boolean; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { success: false, error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { success: false, error: new Error('Not logged in') };

      const weekStartDate = this.getCurrentWeekStartDate();

      const { error } = await supabase
        .from('weekly_ranking_snapshots')
        .upsert({
          user_id: user.id,
          week_start_date: weekStartDate,
          weekly_study_minutes: minutes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, week_start_date'
        });

      return { success: !error, error };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Get weekly ranking of friends and self
   */
  static async getWeeklyRanking(): Promise<{ ranking: FriendSummary[]; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { ranking: [], error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { ranking: [], error: new Error('Not logged in') };

      const { friends, error: friendError } = await FriendService.getFriendsList();
      if (friendError) return { ranking: [], error: friendError };

      const userProfile = await AuthService.getProfile(user.id);
      if (!userProfile) return { ranking: [], error: new Error('User profile not found') };

      const allUsers = [...friends, userProfile];
      const allUserIds = allUsers.map((userProfile) => userProfile.id);
      
      const weekStartDate = this.getCurrentWeekStartDate();

      const { data: snapshots, error: snapError } = await supabase
        .from('weekly_ranking_snapshots')
        .select('user_id, weekly_study_minutes')
        .eq('week_start_date', weekStartDate)
        .in('user_id', allUserIds);

      if (snapError) return { ranking: [], error: snapError };

      const snapshotMap = new Map<string, number>(
        ((snapshots ?? []) as WeeklySnapshotRow[]).map((snapshot) => [
          snapshot.user_id,
          snapshot.weekly_study_minutes,
        ]),
      );

      const ranking: FriendSummary[] = allUsers.map((userProfile) => ({
        userId: userProfile.id,
        displayName: userProfile.displayName,
        activeCharacterId: userProfile.activeCharacterId,
        totalXp: userProfile.totalXp,
        weeklyStudyMinutes: snapshotMap.get(userProfile.id) ?? 0
      }));

      // Sort by study minutes descending
      ranking.sort((a, b) => b.weeklyStudyMinutes - a.weeklyStudyMinutes);

      return { ranking, error: null };
    } catch (e) {
      return { ranking: [], error: e };
    }
  }
}
