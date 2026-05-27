import { describe, expect, test } from '@jest/globals';

import { createReturnGift } from '../domain/returnGift';

describe('return gift', () => {
  test('gives no gift without a previous completion', () => {
    expect(createReturnGift(undefined, '2026-05-26T10:00:00.000Z')).toBeUndefined();
  });

  test('gives no gift when the previous completion was only one day ago', () => {
    expect(
      createReturnGift('2026-05-25T10:00:00.000Z', '2026-05-26T10:00:00.000Z'),
    ).toBeUndefined();
  });

  test('gives a fixed snack gift after the return threshold is reached', () => {
    expect(createReturnGift('2026-05-23T10:00:00.000Z', '2026-05-26T10:00:00.000Z')).toEqual({
      type: 'snack',
      amount: 2,
      grantedAt: '2026-05-26T10:00:00.000Z',
    });
  });

  test('gives no gift for an invalid previous completion timestamp', () => {
    expect(createReturnGift('not-a-date', '2026-05-26T10:00:00.000Z')).toBeUndefined();
  });

  test('gives no gift for an invalid new completion timestamp', () => {
    expect(createReturnGift('2026-05-23T10:00:00.000Z', 'bad-date')).toBeUndefined();
  });

  test('gives no gift when Date parsing normalizes an impossible previous completion timestamp', () => {
    expect(
      createReturnGift('2026-02-30T00:00:00.000Z', '2026-03-04T00:00:00.000Z'),
    ).toBeUndefined();
  });

  test('gives no gift when Date parsing normalizes an impossible new completion timestamp', () => {
    expect(
      createReturnGift('2026-02-27T00:00:00.000Z', '2026-02-30T00:00:00.000Z'),
    ).toBeUndefined();
  });

  test('gives no gift when completion time is earlier than the previous session', () => {
    expect(
      createReturnGift('2026-05-26T10:00:00.000Z', '2026-05-23T10:00:00.000Z'),
    ).toBeUndefined();
  });
});
