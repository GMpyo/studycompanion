import { getOptionalSupabase } from '../supabase/client';
import { AuthService } from '../auth/authService';
import { UserProfile } from './types';

interface FriendshipRow {
  user1_id: string;
  user2_id: string;
}

interface ProfileRow {
  id: string;
  display_name: string;
  active_character_id: string | null;
  total_xp: number;
  created_at: string;
}

export class FriendService {
  /**
   * Send a friend request to another user by their ID
   */
  static async sendFriendRequest(receiverId: string): Promise<{ success: boolean; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { success: false, error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { success: false, error: new Error('Not logged in') };

      if (user.id === receiverId) {
        return { success: false, error: new Error('Cannot send request to yourself') };
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert([{ sender_id: user.id, receiver_id: receiverId, status: 'pending' }]);

      return { success: !error, error };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Accept an incoming friend request
   */
  static async acceptFriendRequest(requestId: string): Promise<{ success: boolean; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { success: false, error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { success: false, error: new Error('Not logged in') };

      // Get the request details
      const { data: request, error: reqError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (reqError || !request) return { success: false, error: reqError || new Error('Request not found') };
      if (request.receiver_id !== user.id) return { success: false, error: new Error('Unauthorized') };

      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateError) return { success: false, error: updateError };

      // Create friendship (ensure user1_id < user2_id)
      const user1_id = request.sender_id < request.receiver_id ? request.sender_id : request.receiver_id;
      const user2_id = request.sender_id < request.receiver_id ? request.receiver_id : request.sender_id;

      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([{ user1_id, user2_id }]);

      return { success: !friendshipError, error: friendshipError };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Get list of accepted friends
   */
  static async getFriendsList(): Promise<{ friends: UserProfile[]; error: any | null }> {
    const supabase = getOptionalSupabase();
    if (!supabase) return { friends: [], error: new Error('Supabase not configured') };

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) return { friends: [], error: new Error('Not logged in') };

      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) return { friends: [], error };

      const friendIds = (friendships as FriendshipRow[]).map((friendship) =>
        friendship.user1_id === user.id ? friendship.user2_id : friendship.user1_id,
      );
      
      if (friendIds.length === 0) return { friends: [], error: null };

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profileError) return { friends: [], error: profileError };

      const friends = (profiles as ProfileRow[]).map((profile) => ({
        id: profile.id,
        displayName: profile.display_name,
        activeCharacterId: profile.active_character_id,
        totalXp: profile.total_xp,
        createdAt: profile.created_at
      }));

      return { friends, error: null };
    } catch (e) {
      return { friends: [], error: e };
    }
  }
}
