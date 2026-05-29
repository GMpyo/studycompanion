import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';

interface IconButtonProps {
  label: string;
  symbol: string;
  onPress: NonNullable<PressableProps['onPress']>;
  disabled?: boolean;
}

export function IconButton({ label, symbol, onPress, disabled = false }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.symbol}>
        {symbol}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.inkStrong,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    backgroundColor: colors.line,
  },
  symbol: {
    color: colors.actionText,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: -1,
    textAlign: 'center',
  },
});
