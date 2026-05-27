import type { RewardBundle } from './types';

const MINIMUM_REWARDED_MINUTES = 15;
const FULL_RATE_DAILY_MINUTES = 240;

export function calculateSessionReward(
  durationMinutes: number,
  rewardedMinutesToday: number,
): RewardBundle {
  if (
    !Number.isFinite(durationMinutes) ||
    !Number.isFinite(rewardedMinutesToday) ||
    durationMinutes < 0 ||
    rewardedMinutesToday < 0 ||
    durationMinutes < MINIMUM_REWARDED_MINUTES
  ) {
    return { xp: 0, snacks: 0, discoveryPoints: 0 };
  }

  const fullRateMinutes = Math.min(
    durationMinutes,
    Math.max(0, FULL_RATE_DAILY_MINUTES - rewardedMinutesToday),
  );
  const reducedMinutes = durationMinutes - fullRateMinutes;
  const effectiveMinutes = fullRateMinutes + Math.floor(reducedMinutes * 0.5);

  return {
    xp: effectiveMinutes,
    snacks: Math.max(1, Math.floor(effectiveMinutes / 15)),
    discoveryPoints: Math.max(1, Math.floor(effectiveMinutes / 10)),
  };
}
