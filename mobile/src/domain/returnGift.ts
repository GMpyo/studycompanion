import type { ReturnGift } from './types';
import { isCanonicalIsoTimestamp } from '../utils/time';

const RETURN_GIFT_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

export function createReturnGift(
  previousCompletedAt: string | undefined,
  completedAt: string,
): ReturnGift | undefined {
  if (!isCanonicalIsoTimestamp(previousCompletedAt) || !isCanonicalIsoTimestamp(completedAt)) {
    return undefined;
  }

  const previousCompletedTime = Date.parse(previousCompletedAt);
  const completedTime = Date.parse(completedAt);
  const elapsedMs = completedTime - previousCompletedTime;

  if (
    elapsedMs < 0 ||
    elapsedMs < RETURN_GIFT_THRESHOLD_MS
  ) {
    return undefined;
  }

  return { type: 'snack', amount: 2, grantedAt: completedAt };
}
