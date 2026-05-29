import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { getOptionalSupabase } from '../services/supabase/client';
import { AuthService } from '../services/auth/authService';
import { FriendService } from '../services/social/friendService';
import { RankingService } from '../services/social/rankingService';

jest.mock('../services/supabase/client', () => ({
  getOptionalSupabase: jest.fn(),
}));

jest.mock('../services/auth/authService', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
    getProfile: jest.fn(),
  },
}));

describe('Social Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendFriendRequest fails if not logged in', async () => {
    jest.mocked(getOptionalSupabase).mockReturnValue({} as never);
    jest.mocked(AuthService.getCurrentUser).mockResolvedValue(null);

    const { success, error } = await FriendService.sendFriendRequest('user-2');
    expect(success).toBe(false);
    expect(error?.message).toBe('Not logged in');
  });

  it('sendFriendRequest prevents sending to self', async () => {
    jest.mocked(getOptionalSupabase).mockReturnValue({} as never);
    jest.mocked(AuthService.getCurrentUser).mockResolvedValue({ id: 'user-1' });

    const { success, error } = await FriendService.sendFriendRequest('user-1');
    expect(success).toBe(false);
    expect(error?.message).toBe('Cannot send request to yourself');
  });

  it('getWeeklyRanking aggregates friends and self', async () => {
    jest.mocked(getOptionalSupabase).mockReturnValue({} as never);
    jest.mocked(AuthService.getCurrentUser).mockResolvedValue({ id: 'user-1' });
    
    jest.spyOn(FriendService, 'getFriendsList').mockResolvedValue({
      friends: [
        { id: 'user-2', displayName: 'Friend 1', activeCharacterId: null, totalXp: 100, createdAt: '' }
      ],
      error: null
    });

    jest.mocked(AuthService.getProfile).mockResolvedValue({
      id: 'user-1', displayName: 'Me', activeCharacterId: null, totalXp: 50, createdAt: ''
    });

    const mockIn = jest.fn<() => Promise<{ data: { user_id: string; weekly_study_minutes: number }[]; error: null }>>().mockResolvedValue({
      data: [
        { user_id: 'user-1', weekly_study_minutes: 60 },
        { user_id: 'user-2', weekly_study_minutes: 120 }
      ],
      error: null
    });
    const mockEq = jest.fn().mockReturnValue({ in: mockIn });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    jest.mocked(getOptionalSupabase).mockReturnValue({
      from: jest.fn().mockReturnValue({ select: mockSelect })
    } as never);

    const { ranking, error } = await RankingService.getWeeklyRanking();
    
    expect(error).toBeNull();
    expect(ranking.length).toBe(2);
    // Sorts descending
    expect(ranking[0].userId).toBe('user-2');
    expect(ranking[0].weeklyStudyMinutes).toBe(120);
    expect(ranking[1].userId).toBe('user-1');
    expect(ranking[1].weeklyStudyMinutes).toBe(60);
  });
});
