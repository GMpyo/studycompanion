import type { CharacterId, CharacterRole, CharacterStage, OwnedCharacter } from './types';

export interface CharacterDexEntry {
  id: CharacterId;
  displayName: string;
  shortBio: string;
  personality: string;
  stageDescriptions: Record<CharacterStage, string>;
  unlockHint: string;
  artKey: string;
}

export type EvolutionSlotState = 'hidden' | 'visible' | 'unlocked';

export interface EvolutionSlot {
  stage: CharacterStage;
  state: EvolutionSlotState;
  label: string;
  description: string;
}

export const STAGE_ORDER: CharacterStage[] = ['egg', 'baby', 'growing', 'adult'];

export const STAGE_LABELS: Record<CharacterStage, string> = {
  egg: '알',
  baby: '아기',
  growing: '성장기',
  adult: '성체',
};

export const ROLE_LABELS: Record<CharacterRole, string> = {
  attack: '공격형',
  defense: '방어형',
  heal: '회복형',
  support: '지원형',
};

export const CHARACTER_DEX: Record<CharacterId, CharacterDexEntry> = {
  'starter-sprout': {
    id: 'starter-sprout',
    displayName: '새싹콩',
    shortBio: '작은 잎으로 공부 자리를 포근하게 지켜주는 첫 친구.',
    personality: '느리지만 꾸준하고, 긴 공부가 끝나면 조용히 옆에서 기뻐한다.',
    stageDescriptions: {
      egg: '잎맥이 비치는 작은 씨앗. 아직은 따뜻한 빛을 모으는 중이다.',
      baby: '작은 새싹이 나와 책상 위의 소음을 막아준다.',
      growing: '넓어진 잎으로 집중 공간을 감싸는 보호자가 된다.',
      adult: '단단한 줄기와 잎 방패로 긴 공부 루틴을 지탱한다.',
    },
    unlockHint: '첫 캐릭터 선택에서 만날 수 있어요.',
    artKey: 'sprout',
  },
  'starter-comet': {
    id: 'starter-comet',
    displayName: '별꼬리',
    shortBio: '반짝이는 꼬리로 공부 시작 버튼을 밀어주는 활발한 친구.',
    personality: '짧은 집중도 놓치지 않고 반응하는 에너지형 동료.',
    stageDescriptions: {
      egg: '별빛이 안쪽에서 맴도는 작은 알.',
      baby: '꼬리 끝이 반짝이며 짧은 공부에도 힘을 보탠다.',
      growing: '빛의 궤적을 남기며 스테이지를 빠르게 밀어준다.',
      adult: '긴 집중을 별자리처럼 이어 붙이는 추진형 친구가 된다.',
    },
    unlockHint: '첫 캐릭터 선택에서 만날 수 있어요.',
    artKey: 'comet',
  },
  'starter-mallow': {
    id: 'starter-mallow',
    displayName: '몽실이',
    shortBio: '부드러운 숨결로 지친 마음을 달래주는 회복형 친구.',
    personality: '차분하고 다정해서 다시 시작하는 순간에 강하다.',
    stageDescriptions: {
      egg: '말랑한 구름결을 품은 조용한 알.',
      baby: '작은 손으로 간식을 받아 먹으며 친밀도를 쌓는다.',
      growing: '공부 후 피로를 덜어주는 포근한 기운이 커진다.',
      adult: '오래 쉬었다 돌아와도 다시 앉을 수 있게 도와준다.',
    },
    unlockHint: '첫 캐릭터 선택에서 만날 수 있어요.',
    artKey: 'mallow',
  },
  'cloud-puff': {
    id: 'cloud-puff',
    displayName: '구름퐁',
    shortBio: '작은 구름 위에서 응원의 소리를 들려주는 지원형 친구.',
    personality: '혼자 공부하는 시간을 덜 외롭게 만드는 밝은 성격.',
    stageDescriptions: {
      egg: '안개처럼 흐릿한 구름 알.',
      baby: '둥실 떠다니며 오늘의 목표를 살짝 밀어준다.',
      growing: '구름 방울을 모아 스테이지 진행을 응원한다.',
      adult: '친구들과 함께할 때 팀 분위기를 부드럽게 만든다.',
    },
    unlockHint: '발견 포인트를 모으면 처음으로 만날 가능성이 높아요.',
    artKey: 'cloud',
  },
  'ember-dot': {
    id: 'ember-dot',
    displayName: '불빛점',
    shortBio: '작은 불씨처럼 짧지만 강한 집중을 좋아하는 공격형 친구.',
    personality: '시작이 느린 날에도 첫 15분을 켜는 데 능하다.',
    stageDescriptions: {
      egg: '따뜻한 점 하나가 깜빡이는 불씨 알.',
      baby: '작은 불꽃으로 공부 시작의 저항을 태운다.',
      growing: '연속 세션을 이어갈수록 밝게 타오른다.',
      adult: '보스 스테이지 앞에서 강한 추진력을 낸다.',
    },
    unlockHint: '꾸준히 세션을 완료해 발견 포인트를 모아보세요.',
    artKey: 'ember',
  },
  'shell-nap': {
    id: 'shell-nap',
    displayName: '조개잠',
    shortBio: '단단한 조개껍질 아래에서 안전한 공부 리듬을 만드는 방어형 친구.',
    personality: '급하지 않고 오래 버티는 루틴에 강하다.',
    stageDescriptions: {
      egg: '작은 조개 무늬가 생긴 단단한 알.',
      baby: '껍질 속에서 고개를 내밀고 공부 시간을 지킨다.',
      growing: '흔들리는 날에도 루틴을 보호하는 껍질이 두꺼워진다.',
      adult: '긴 챕터를 안정적으로 밀 수 있는 든든한 친구가 된다.',
    },
    unlockHint: '여러 날 공부 기록을 쌓으면 만날 수 있어요.',
    artKey: 'shell',
  },
  'dew-bell': {
    id: 'dew-bell',
    displayName: '이슬방울',
    shortBio: '맑은 이슬 소리로 머리를 식혀주는 회복형 친구.',
    personality: '지친 날의 짧은 복귀 세션을 특히 좋아한다.',
    stageDescriptions: {
      egg: '투명한 물빛이 맺힌 알.',
      baby: '작은 방울 소리로 쉬운 시작을 도와준다.',
      growing: '공부 후 회복 리듬을 부드럽게 만든다.',
      adult: '긴 휴식 뒤에도 다시 돌아오는 힘을 준다.',
    },
    unlockHint: '복귀 세션과 꾸준한 완료 기록으로 발견 기회를 늘려보세요.',
    artKey: 'dew',
  },
  'moon-ribbon': {
    id: 'moon-ribbon',
    displayName: '달리본',
    shortBio: '밤 공부의 조용한 리듬을 묶어주는 지원형 친구.',
    personality: '천천히 쌓이는 기록을 아름답게 정리하는 타입.',
    stageDescriptions: {
      egg: '달빛 리본이 희미하게 감긴 알.',
      baby: '작은 리본으로 오늘의 끝을 표시해준다.',
      growing: '밤의 집중 시간을 부드러운 흐름으로 이어준다.',
      adult: '주간 기록과 친구 랭킹에서 조용한 존재감을 낸다.',
    },
    unlockHint: '발견 포인트를 모아 도감을 계속 열어보세요.',
    artKey: 'moon',
  },
};

export function getCharacterDexEntry(characterId: CharacterId): CharacterDexEntry {
  return CHARACTER_DEX[characterId];
}

export function getEvolutionSlots(character: OwnedCharacter): EvolutionSlot[] {
  const entry = getCharacterDexEntry(character.id);
  const currentStageIndex = STAGE_ORDER.indexOf(character.stage);

  return STAGE_ORDER.map((stage, index) => {
    if (!character.discovered) {
      return {
        stage,
        state: 'hidden',
        label: '???',
        description: '아직 밝혀지지 않은 진화 단계예요.',
      };
    }

    const state: EvolutionSlotState = index <= currentStageIndex ? 'unlocked' : 'visible';
    const label = state === 'unlocked' ? STAGE_LABELS[stage] : `${STAGE_LABELS[stage]} 실루엣`;
    const description =
      state === 'unlocked' ? entry.stageDescriptions[stage] : '공부를 이어가면 모습이 밝혀져요.';

    return { stage, state, label, description };
  });
}
