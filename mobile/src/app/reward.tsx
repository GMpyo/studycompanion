import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { CHARACTER_CATALOG } from '@/domain/catalog';
import type { CharacterStage, ReturnGift } from '@/domain/types';
import { useAppStore } from '@/state/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';

const STAGE_LABELS: Record<CharacterStage, string> = {
  egg: '알',
  baby: '아기',
  growing: '성장기',
  adult: '성체',
};

function formatReturnGift(gift: ReturnGift): string {
  if (gift.type === 'snack') {
    return `간식 ${gift.amount}개`;
  }

  if (gift.type === 'decor') {
    return `장식 ${gift.amount}개`;
  }

  return `친밀도 ${gift.amount}`;
}

export default function RewardScreen() {
  const router = useRouter();
  const receipt = useAppStore((state) => state.data.lastReward);

  if (!receipt) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyCard}>
          <Text style={styles.title}>표시할 보상이 없어요</Text>
          <Text style={styles.message}>집중을 완료하면 받은 보상을 확인할 수 있어요.</Text>
          <PrimaryButton label="홈으로 돌아가기" onPress={() => router.push('/')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>집중 보상</Text>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardValue}>경험치 +{receipt.reward.xp}</Text>
          <Text style={styles.rewardValue}>간식 +{receipt.reward.snacks}</Text>
          <Text style={styles.rewardValue}>발견 포인트 +{receipt.reward.discoveryPoints}</Text>
        </View>

        {receipt.grewFrom && receipt.grewTo ? (
          <Text style={styles.event}>
            성장: {STAGE_LABELS[receipt.grewFrom]} → {STAGE_LABELS[receipt.grewTo]}
          </Text>
        ) : null}
        {receipt.unlockedCharacterId ? (
          <Text style={styles.event}>
            새 친구 발견: {CHARACTER_CATALOG[receipt.unlockedCharacterId].name}
          </Text>
        ) : null}
        {receipt.returnGift ? (
          <Text style={styles.event}>돌아온 선물: {formatReturnGift(receipt.returnGift)}</Text>
        ) : null}

        <PrimaryButton label="홈으로 돌아가기" onPress={() => router.push('/')} />
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
  emptyCard: {
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
  message: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  rewardCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
  },
  rewardValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  event: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    color: colors.accentInk,
    fontSize: 16,
    fontWeight: '600',
    padding: spacing.md,
  },
});
