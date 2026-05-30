import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StageProgressPanel } from '@/components/stage/StageProgressPanel';
import { createInitialStageProgress } from '@/domain/stageProgression';
import { useAppStore } from '@/state/useAppStore';
import { colors, spacing } from '@/theme/tokens';

export default function StageScreen() {
  const sessions = useAppStore((state) => state.data.sessions);
  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const progress = createInitialStageProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>개인 레이드</Text>
        <Text style={styles.caption}>공부 시간으로 방해 보스의 HP를 깎는 솔로 토벌전이에요.</Text>
        <Text style={styles.caption}>현재 누적 공부 기록 {totalMinutes}분</Text>
        <StageProgressPanel progress={progress} />
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
    color: colors.inkStrong,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  caption: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
