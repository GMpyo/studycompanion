import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterDexDetail } from '@/components/characterDex/CharacterDexDetail';
import { CHARACTER_CATALOG } from '@/domain/catalog';
import type { CharacterId } from '@/domain/types';
import { useAppStore } from '@/state/useAppStore';
import { colors, spacing } from '@/theme/tokens';

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && value in CHARACTER_CATALOG;
}

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const data = useAppStore((state) => state.data);

  if (!isCharacterId(id)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.error}>캐릭터를 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <CharacterDexDetail character={data.characters[id]} />
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
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3,
  },
  error: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '700',
    padding: spacing.lg,
  },
});
