import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/tokens';

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  trailing?: string;
}

export function SectionHeader({ title, eyebrow, trailing }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  copy: {
    flexShrink: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.study,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  title: {
    color: colors.inkStrong,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  trailing: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
