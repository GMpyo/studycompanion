import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterCard } from '@/components/CharacterCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CHARACTER_CATALOG } from '@/domain/catalog';
import type { CharacterId } from '@/domain/types';
import { useAppStore } from '@/state/useAppStore';
import { colors, radius, spacing } from '@/theme/tokens';

const SAVE_FAILURE_MESSAGE = '저장하지 못했어요. 다시 시도해 주세요.';

export default function CollectionScreen() {
  const data = useAppStore((state) => state.data);
  const setActiveCharacter = useAppStore((state) => state.setActiveCharacter);
  const [failure, setFailure] = useState<string | null>(null);
  const selectionAttempt = useRef(0);

  function selectActiveCharacter(characterId: CharacterId) {
    const attempt = ++selectionAttempt.current;

    setFailure(null);
    void setActiveCharacter(characterId).catch(() => {
      if (attempt === selectionAttempt.current) {
        setFailure(SAVE_FAILURE_MESSAGE);
      }
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>나의 도감</Text>
        <Text style={styles.points}>발견 포인트 {data.discoveryPoints}</Text>

        {failure ? (
          <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.error}>
            {failure}
          </Text>
        ) : null}

        {(Object.keys(CHARACTER_CATALOG) as CharacterId[]).map((characterId) => {
          const character = data.characters[characterId];
          const definition = CHARACTER_CATALOG[characterId];

          if (!character.discovered) {
            return (
              <View accessibilityLabel="아직 미발견" key={characterId} style={styles.mysteryCard}>
                <View style={styles.silhouette} />
                <Text style={styles.mysteryTitle}>아직 미발견</Text>
                <Text style={styles.mysteryMessage}>공부하며 새로운 친구를 만나보세요.</Text>
              </View>
            );
          }

          return (
            <View key={characterId} style={styles.discoveredCard}>
              <CharacterCard character={character} compact />
              {data.activeCharacterId === characterId ? (
                <Text style={styles.activeMarker}>함께 공부 중</Text>
              ) : (
                <PrimaryButton
                  label={`${definition.name} 대표로 선택`}
                  onPress={() => selectActiveCharacter(characterId)}
                />
              )}
            </View>
          );
        })}
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
  points: {
    color: colors.accentInk,
    fontSize: 18,
    fontWeight: '700',
  },
  error: {
    color: colors.action,
    fontSize: 14,
    fontWeight: '700',
  },
  discoveredCard: {
    gap: spacing.md,
  },
  activeMarker: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    color: colors.accentInk,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mysteryCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  silhouette: {
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    height: 64,
    width: 52,
  },
  mysteryTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  mysteryMessage: {
    color: colors.muted,
    fontSize: 14,
  },
});
