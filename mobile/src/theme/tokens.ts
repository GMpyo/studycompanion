export const colors = {
  background: '#FFF9F2',
  surface: '#FFFFFF',
  panel: '#FFFCF7',
  panelMuted: '#F5EFE6',
  panelBorder: '#E3D7C8',
  ink: '#2E2A30',
  inkStrong: '#18151A',
  muted: '#776E75',
  accent: '#FF8769',
  accentSoft: '#FFE5DC',
  action: '#A83F28',
  actionText: '#FFFFFF',
  accentInk: '#7F2F20',
  line: '#F0E3DB',
  study: '#2F6F73',
  studySoft: '#DFF1EC',
  reward: '#B86B1F',
  rewardSoft: '#FCE8C8',
  danger: '#A43E3E',
  shadow: '#2E241C',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  raised: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
} as const;
