import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';

interface ProgressMeterProps {
  label: string;
  value: number;
  max: number;
}

export function ProgressMeter({ label, value, max }: ProgressMeterProps) {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(1, Math.max(0, value / safeMax));
  const percentage = Math.round(ratio * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{percentage}%</Text>
      </View>
      <View accessibilityLabel={`${label} ${percentage}%`} accessibilityRole="progressbar" style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  value: {
    color: colors.inkStrong,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  track: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.study,
    borderRadius: radius.pill,
    height: '100%',
  },
});
