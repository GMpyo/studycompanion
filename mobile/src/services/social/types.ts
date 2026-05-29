export interface UserProfile {
  id: string;
  displayName: string;
  activeCharacterId: string | null;
  totalXp: number;
  createdAt: string;
}

export interface FriendSummary {
  userId: string;
  displayName: string;
  activeCharacterId: string | null;
  weeklyStudyMinutes: number;
  totalXp: number;
}

export interface CloudSavePayload {
  appDataVersion: number;
  appData: unknown;
  updatedAt: string;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
}
