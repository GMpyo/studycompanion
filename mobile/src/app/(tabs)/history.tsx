import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { StudySession } from '@/domain/types';
import { useAppStore } from '@/state/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { formatMinutes, localDateKey } from '@/utils/time';

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface DatedSession {
  session: StudySession;
  completedAtMs: number;
}

function validDatedSessions(sessions: StudySession[]): DatedSession[] {
  return sessions
    .map((session) => ({ session, completedAtMs: Date.parse(session.completedAt) }))
    .filter(
      ({ session, completedAtMs }) =>
        Number.isFinite(completedAtMs) &&
        Number.isFinite(session.durationMinutes) &&
        session.durationMinutes >= 0,
    )
    .sort((first, second) => second.completedAtMs - first.completedAtMs);
}

export default function HistoryScreen() {
  const sessions = useAppStore((state) => state.data.sessions);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const todayKey = localDateKey(new Date(now).toISOString());
  const completedSessions = validDatedSessions(sessions);
  const todayMinutes = completedSessions
    .filter(
      ({ session, completedAtMs }) =>
        completedAtMs <= now && localDateKey(session.completedAt) === todayKey,
    )
    .reduce((minutes, { session }) => minutes + session.durationMinutes, 0);
  const recentMinutes = completedSessions
    .filter(
      ({ completedAtMs }) =>
        completedAtMs <= now && completedAtMs >= now - RECENT_WINDOW_MS,
    )
    .reduce((minutes, { session }) => minutes + session.durationMinutes, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>공부 기록</Text>

        <View style={styles.summary}>
          <Text style={styles.total}>오늘 총 공부 {formatMinutes(todayMinutes)}</Text>
          <Text style={styles.total}>최근 7일 총 공부 {formatMinutes(recentMinutes)}</Text>
        </View>

        <Text style={styles.sectionTitle}>최근 완료 기록</Text>
        {completedSessions.length === 0 ? (
          <Text style={styles.empty}>아직 공부 기록이 없어요</Text>
        ) : (
          completedSessions.map(({ session }) => (
            <View key={session.id} style={styles.sessionRow}>
              <Text style={styles.duration}>{formatMinutes(session.durationMinutes)} 공부</Text>
              <Text style={styles.completedDate}>{localDateKey(session.completedAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  summary: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  total: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    color: colors.muted,
    fontSize: 16,
  },
  sessionRow: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  duration: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  completedDate: {
    color: colors.muted,
    fontSize: 14,
  },
});
