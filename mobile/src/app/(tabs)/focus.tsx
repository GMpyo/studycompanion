import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import type { StudySession } from '@/domain/types';
import { recoverElapsedMinutes, useAppStore } from '@/state/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { formatMinutes } from '@/utils/time';

const SAVE_FAILURE_MESSAGE = '기록을 저장하지 못했어요. 다시 시도해 주세요.';
const CLOCK_FAILURE_MESSAGE = '기기 시간을 확인한 뒤 다시 시도해 주세요.';

export default function FocusScreen() {
  const router = useRouter();
  const data = useAppStore((state) => state.data);
  const startSessionWithResult = useAppStore((state) => state.startSessionWithResult);
  const completeSessionWithResult = useAppStore((state) => state.completeSessionWithResult);
  const clearActiveSession = useAppStore((state) => state.clearActiveSession);
  const startedAt = data.activeSessionStartedAt;
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const timer = setInterval(() => {
      setNowIso(new Date().toISOString());
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  if (!data.selectedStarter || !data.activeCharacterId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guardCard}>
          <Text style={styles.title}>집중</Text>
          <Text style={styles.message}>공부 친구를 먼저 선택해 주세요</Text>
          <PrimaryButton label="홈으로 돌아가기" onPress={() => router.push('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const elapsedMinutes = recoverElapsedMinutes(startedAt, nowIso);

  async function beginSession() {
    if (saving) {
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      const started = await startSessionWithResult();

      if (!started) {
        setSaving(false);
        setFailure(CLOCK_FAILURE_MESSAGE);
        return;
      }

      setNowIso(new Date().toISOString());
      setSaving(false);
    } catch {
      setSaving(false);
      setFailure(SAVE_FAILURE_MESSAGE);
    }
  }

  async function finishSession() {
    if (!startedAt || saving) {
      return;
    }

    const completedAt = new Date().toISOString();
    const startedAtMs = Date.parse(startedAt);
    const completedAtMs = Date.parse(completedAt);
    const session: StudySession = {
      id: `session-${startedAtMs}-${completedAtMs}`,
      startedAt,
      completedAt,
      durationMinutes: recoverElapsedMinutes(startedAt, completedAt),
      rewardClaimed: false,
    };

    setSaving(true);
    setFailure(null);

    try {
      const completed = await completeSessionWithResult(session);

      if (!completed) {
        setSaving(false);
        setFailure(CLOCK_FAILURE_MESSAGE);
        return;
      }

      setSaving(false);
      router.push('/reward');
    } catch {
      setSaving(false);
      setFailure(SAVE_FAILURE_MESSAGE);
    }
  }

  async function cancelSession() {
    if (!startedAt || saving) {
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      await clearActiveSession();
      setSaving(false);
    } catch {
      setSaving(false);
      setFailure(SAVE_FAILURE_MESSAGE);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>집중</Text>
        <Text style={styles.status}>{startedAt ? '집중 중' : '준비됨'}</Text>
        <Text style={styles.timer}>{formatMinutes(elapsedMinutes)}</Text>
        <Text style={styles.message}>공부가 끝나면 보상을 확인할 수 있어요.</Text>

        {startedAt ? (
          <>
            <PrimaryButton
              label={saving ? '저장 중...' : '집중 완료'}
              disabled={saving}
              onPress={() => void finishSession()}
            />
            <PrimaryButton
              label="타이머 취소"
              disabled={saving}
              onPress={() => void cancelSession()}
            />
          </>
        ) : (
          <PrimaryButton
            label={saving ? '저장 중...' : '집중 시작'}
            disabled={saving}
            onPress={() => void beginSession()}
          />
        )}

        {failure ? (
          <Text
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={styles.failure}>
            {failure}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  guardCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.lg,
    margin: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  status: {
    color: colors.accentInk,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  timer: {
    color: colors.ink,
    fontSize: 52,
    fontWeight: '800',
    marginVertical: spacing.lg,
    textAlign: 'center',
  },
  message: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  failure: {
    color: colors.action,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
