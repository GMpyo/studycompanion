import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { getOptionalSupabase } from '../services/supabase/client';
import { SyncService } from '../services/supabase/syncService';
import { AuthService } from '../services/auth/authService';

// Mock client
jest.mock('../services/supabase/client', () => ({
  getOptionalSupabase: jest.fn(),
}));

jest.mock('../services/auth/authService', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
  },
}));

describe('Supabase Client & SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SyncService returns error when Supabase is not configured', async () => {
    jest.mocked(getOptionalSupabase).mockReturnValue(null);
    const result = await SyncService.uploadSave({ test: 1 }, 1);
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Supabase not configured');
  });

  it('SyncService fails when user is not logged in', async () => {
    jest.mocked(getOptionalSupabase).mockReturnValue({} as never);
    jest.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
    const result = await SyncService.downloadSave();
    expect(result.save).toBeNull();
    expect(result.error?.message).toBe('Not logged in');
  });

  it('SyncService successfully uploads save', async () => {
    const mockUpsert = jest.fn<() => Promise<{ error: null }>>().mockResolvedValue({ error: null });
    const mockEq = jest.fn<() => Promise<{ error: null }>>().mockResolvedValue({ error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn((table: string) => {
      if (table === 'cloud_saves') return { upsert: mockUpsert };
      if (table === 'profiles') return { update: mockUpdate };
      return {};
    });

    jest.mocked(getOptionalSupabase).mockReturnValue({ from: mockFrom } as never);
    jest.mocked(AuthService.getCurrentUser).mockResolvedValue({ id: 'user-1' });

    const result = await SyncService.uploadSave({ activeCharacterId: 'char-1' }, 1);
    expect(result.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalled();
  });
});
