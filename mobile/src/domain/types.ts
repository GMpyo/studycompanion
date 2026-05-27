export type CharacterStage = 'egg' | 'baby' | 'growing' | 'adult';
export type CharacterRole = 'attack' | 'defense' | 'heal' | 'support';
export type GiftType = 'snack' | 'decor' | 'friendship';
export type CharacterId =
  | 'starter-sprout'
  | 'starter-comet'
  | 'starter-mallow'
  | 'cloud-puff'
  | 'ember-dot'
  | 'shell-nap'
  | 'dew-bell'
  | 'moon-ribbon';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  description: string;
  role: CharacterRole;
  skillName: string;
  starter: boolean;
  palette: {
    primary: string;
    secondary: string;
  };
}

export interface OwnedCharacter {
  id: CharacterId;
  stage: CharacterStage;
  xp: number;
  friendship: number;
  discovered: boolean;
}

export interface StudySession {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  rewardClaimed: boolean;
}

export interface RewardBundle {
  xp: number;
  snacks: number;
  discoveryPoints: number;
}

export interface ReturnGift {
  type: GiftType;
  amount: number;
  grantedAt: string;
}

export interface RewardReceipt {
  sessionId: string;
  reward: RewardBundle;
  characterId: CharacterId;
  grewFrom?: CharacterStage;
  grewTo?: CharacterStage;
  unlockedCharacterId?: CharacterId;
  returnGift?: ReturnGift;
}

export interface AppData {
  selectedStarter: boolean;
  activeCharacterId: CharacterId | null;
  activeSessionStartedAt?: string;
  characters: Record<CharacterId, OwnedCharacter>;
  sessions: StudySession[];
  snacks: number;
  discoveryPoints: number;
  decorTokens: number;
  lastReward?: RewardReceipt;
}
