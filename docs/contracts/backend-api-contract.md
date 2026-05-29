# Backend API Contract (Supabase & Social Layer)

이 문서는 모바일 앱(공부시간어플)과 Supabase 백엔드 간의 데이터 교환 규격, 데이터베이스 스키마 및 서비스 동작 원칙을 정의합니다.

## 1. 데이터베이스 스키마

Supabase에서 사용할 핵심 테이블 5가지입니다.

### 1.1 `profiles`
사용자의 기본 정보 저장. (Auth 테이블과 1:1 매칭)
- `id` (uuid, primary key, references auth.users)
- `display_name` (text, not null)
- `created_at` (timestamp with time zone, default now())
- `active_character_id` (text, nullable)
- `total_xp` (integer, default 0)

### 1.2 `cloud_saves`
로컬 `AppData`를 클라우드에 백업/동기화하기 위한 테이블.
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles(id))
- `app_data_version` (integer, not null)
- `app_data` (jsonb, not null)
- `updated_at` (timestamp with time zone, default now())

### 1.3 `friend_requests`
사용자 간 친구 요청을 관리.
- `id` (uuid, primary key)
- `sender_id` (uuid, references profiles(id))
- `receiver_id` (uuid, references profiles(id))
- `status` (text, 'pending', 'accepted', 'rejected')
- `created_at` (timestamp with time zone, default now())
- `updated_at` (timestamp with time zone, default now())

### 1.4 `friendships`
친구 관계. (양방향이거나 단방향 2개 행으로 관리 가능, 여기선 단순화를 위해 1행(user1, user2)으로 관리하되 user1 < user2 제약 조건 적용)
- `id` (uuid, primary key)
- `user1_id` (uuid, references profiles(id))
- `user2_id` (uuid, references profiles(id))
- `created_at` (timestamp with time zone, default now())

### 1.5 `weekly_ranking_snapshots`
친구들 간의 주간 랭킹을 위한 스냅샷 기록.
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles(id))
- `week_start_date` (date, not null)
- `weekly_study_minutes` (integer, default 0)
- `updated_at` (timestamp with time zone, default now())

## 2. 모바일 서비스 레이어 설계

### 2.1 공통 타입 제안 (`mobile/src/services/social/types.ts` 또는 통합 후 `domain/types.ts`)

```ts
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
```

### 2.2 인증 서비스 (`AuthService`)
- `signInAnonymously()`: 비회원 로컬 이용 시 자동 생성 또는 필요시 호출.
- `signInWithEmail(email, password)`
- `signOut()`
- `getCurrentUser()`

### 2.3 소셜 서비스 (`SocialService` / `FriendService`)
- `sendFriendRequest(receiverId: string)`
- `acceptFriendRequest(requestId: string)`
- `getFriendsList()`
- `getWeeklyRanking()`: 현재 사용자의 친구들 + 본인의 주간 공부 시간 및 누적 XP를 가져와 정렬.

### 2.4 클라우드 동기화 서비스 (`SyncService`)
- `uploadSave(appData: any, version: number)`
- `downloadSave(): Promise<CloudSavePayload | null>`

## 3. 오프라인 & 미로그인 동작 원칙
- **Supabase 의존성 최소화**: Supabase 프로젝트 URL 및 Anon Key가 없거나, 네트워크 연결이 끊긴 상태에서도 로컬 데이터(공부, 경험치 지급, 간식)는 정상 동작해야 합니다.
- **Fail-Safe**: 모든 Supabase 호출 서비스(client.ts 포함)는 초기화 실패나 네트워크 에러 발생 시 앱을 크래시 시키지 않고 gracefully fail 되도록 `try-catch`로 감싸야 합니다.
