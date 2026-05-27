import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

interface PrimaryButtonProps {
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}>
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.action,
    borderRadius: radius.pill,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressedButton: {
    opacity: 0.85,
  },
  disabledButton: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    color: colors.actionText,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  disabledLabel: {
    color: colors.muted,
  },
});
