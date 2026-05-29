import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';

type StatPillTone = 'neutral' | 'study' | 'reward';

interface StatPillProps {
  label: string;
  value: string | number;
  tone?: StatPillTone;
}

const TONE_STYLES: Record<StatPillTone, { backgroundColor: string; color: string }> = {
  neutral: { backgroundColor: colors.panelMuted, color: colors.ink },
  study: { backgroundColor: colors.studySoft, color: colors.study },
  reward: { backgroundColor: colors.rewardSoft, color: colors.reward },
};

export function StatPill({ label, value, tone = 'neutral' }: StatPillProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
      <Text style={[styles.value, { color: toneStyle.color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  value: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
});
