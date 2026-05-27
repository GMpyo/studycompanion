import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterCard } from '@/components/CharacterCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CHARACTER_CATALOG, STARTER_IDS } from '@/domain/catalog';
import type { ReturnGift } from '@/domain/types';
import { useAppStore } from '@/state/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { formatMinutes, localDateKey } from '@/utils/time';

const ACTION_FAILURE_MESSAGE = '저장하지 못했어요. 다시 시도해 주세요.';

function starterActionLabel(name: string): string {
  const finalSyllable = name.charCodeAt(name.length - 1) - 0xac00;
  const hasFinalConsonant = finalSyllable >= 0 && finalSyllable <= 0x2ba3 && finalSyllable % 28 !== 0;

  return `${name}${hasFinalConsonant ? '과' : '와'} 시작하기`;
}

function formatReturnGift(returnGift: ReturnGift): string {
  const label = {
    snack: '간식',
    decor: '장식',
    friendship: '친밀도',
  }[returnGift.type];
  const unit = returnGift.type === 'friendship' ? '' : '개';

  return `돌아온 선물: ${label} ${returnGift.amount}${unit}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const data = useAppStore((state) => state.data);
  const selectStarter = useAppStore((state) => state.selectStarter);
  const feedCharacter = useAppStore((state) => state.feedCharacter);
  const [actionFailure, setActionFailure] = useState<string | null>(null);
  const actionAttempt = useRef(0);

  function runAction(action: () => Promise<void>) {
    const attempt = ++actionAttempt.current;
    setActionFailure(null);
    void action().catch(() => {
      if (attempt === actionAttempt.current) {
        setActionFailure(ACTION_FAILURE_MESSAGE);
      }
    });
  }

  if (!data.selectedStarter || !data.activeCharacterId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>첫 공부 친구를 골라주세요</Text>
          <Text style={styles.intro}>함께 집중할 친구를 하나 선택해 주세요.</Text>
          {actionFailure ? (
            <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>
              {actionFailure}
            </Text>
          ) : null}

          {STARTER_IDS.map((starterId) => (
            <View key={starterId} style={styles.starterChoice}>
              <CharacterCard character={data.characters[starterId]} compact />
              <PrimaryButton
                label={starterActionLabel(CHARACTER_CATALOG[starterId].name)}
                onPress={() => {
                  runAction(() => selectStarter(starterId));
                }}
              />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const active = data.characters[data.activeCharacterId];
  const todayKey = localDateKey(new Date().toISOString());
  const studiedMinutesToday = data.sessions
    .filter((session) => localDateKey(session.completedAt) === todayKey)
    .reduce((minutes, session) => minutes + session.durationMinutes, 0);
  const returnGift = data.lastReward?.returnGift;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>나의 공부 친구</Text>
        <CharacterCard character={active} />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>오늘 공부 {formatMinutes(studiedMinutesToday)}</Text>
          <Text style={styles.snackCount}>보유 간식 {data.snacks}개</Text>
          {returnGift ? <Text style={styles.gift}>{formatReturnGift(returnGift)}</Text> : null}
          {actionFailure ? (
            <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>
              {actionFailure}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="집중 시작" onPress={() => router.push('/focus')} />
          <PrimaryButton
            label="간식 주기"
            disabled={data.snacks < 1}
            onPress={() => {
              runAction(() => feedCharacter(active.id));
            }}
          />
        </View>
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
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
  },
  intro: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  starterChoice: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  summary: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  summaryTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  snackCount: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  gift: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    color: colors.accentInk,
    fontSize: 14,
    fontWeight: '700',
    padding: spacing.md,
  },
  error: {
    color: colors.accentInk,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
  },
});
