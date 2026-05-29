import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { getOptionalSupabase } from '../services/supabase/client';
import { AuthService } from '../services/auth/authService';

jest.mock('../services/supabase/client', () => ({
  getOptionalSupabase: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signInAnonymously fails safely when offline', async () => {
    jest.mocked(getOptionalSupabase).mockReturnValue(null);
    const { user, error } = await AuthService.signInAnonymously();
    expect(user).toBeNull();
    expect(error?.message).toBe('Supabase not configured');
  });

  it('signInAnonymously creates profile if successful', async () => {
    const mockInsert = jest.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null });
    const mockSingle = jest.fn<() => Promise<{ data: null; error: null }>>().mockResolvedValue({ data: null, error: null });
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect, insert: mockInsert });
    const mockSignInAnonymously = jest.fn<() => Promise<{ data: { user: { id: string } }; error: null }>>().mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    jest.mocked(getOptionalSupabase).mockReturnValue({
      auth: { signInAnonymously: mockSignInAnonymously },
      from: mockFrom,
    } as never);

    const { user, error } = await AuthService.signInAnonymously();
    expect(user?.id).toBe('user-123');
    expect(error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockInsert).toHaveBeenCalled();
  });
});
