import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme/tokens';

interface GameSurfaceProps {
  children: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function GameSurface({ children, compact = false, style, testID }: GameSurfaceProps) {
  return <View testID={testID} style={[styles.surface, compact && styles.compact, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    ...shadows.soft,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  compact: {
    padding: spacing.md,
  },
});
