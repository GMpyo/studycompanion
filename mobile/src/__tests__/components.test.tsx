import { describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { CharacterCard } from '../components/CharacterCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { GameSurface } from '../components/ui/GameSurface';
import { IconButton } from '../components/ui/IconButton';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatPill } from '../components/ui/StatPill';
import { createInitialState } from '../state/initialState';
import { colors, shadows } from '../theme/tokens';

describe('CharacterCard', () => {
  test('shows the starter companion details and progress', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];

    render(<CharacterCard character={character} />);

    expect(screen.getByText('새싹콩')).toBeTruthy();
    expect(screen.getByText('알')).toBeTruthy();
    expect(screen.getByText('포근한 보호막')).toBeTruthy();
    expect(screen.getByText('경험치 0')).toBeTruthy();
    expect(screen.getByText('친밀도 0')).toBeTruthy();
  });

  test('keeps progress visible in compact mode', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];

    render(<CharacterCard character={character} compact />);

    expect(screen.getByText('경험치 0')).toBeTruthy();
    expect(screen.getByText('친밀도 0')).toBeTruthy();
  });

  test('uses accessible accent ink for stage badge text', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];

    render(<CharacterCard character={character} />);

    expect(colors).toMatchObject({ accentInk: '#7F2F20' });
    expect(StyleSheet.flatten(screen.getByText('알').props.style)).toMatchObject({
      backgroundColor: colors.accentSoft,
      color: colors.accentInk,
    });
  });

  test('renders the current stage pixel art', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];

    render(<CharacterCard character={character} />);

    expect(screen.getByLabelText('새싹콩 알 이미지')).toBeTruthy();
  });
});

describe('PrimaryButton', () => {
  test('calls its handler once when pressed', () => {
    const onPress = jest.fn();

    render(<PrimaryButton label="집중 시작" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: '집중 시작' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('uses accessible action colors for its enabled state', () => {
    render(<PrimaryButton label="집중 시작" onPress={jest.fn()} />);

    expect(colors).toMatchObject({ action: '#A83F28', actionText: '#FFFFFF' });
    expect(StyleSheet.flatten(screen.getByRole('button', { name: '집중 시작' }).props.style)).toMatchObject({
      backgroundColor: colors.action,
    });
    expect(StyleSheet.flatten(screen.getByText('집중 시작').props.style)).toMatchObject({
      color: colors.actionText,
    });
  });

  test('does not call its handler when disabled', () => {
    const onPress = jest.fn();

    render(<PrimaryButton label="집중 시작" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button', { name: '집중 시작' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('premium UI primitives', () => {
  test('renders a game surface with the elevated panel treatment', () => {
    render(
      <GameSurface testID="surface">
        <SectionHeader title="스테이지" eyebrow="오늘의 진행" />
      </GameSurface>,
    );

    expect(screen.getByText('오늘의 진행')).toBeTruthy();
    expect(screen.getByText('스테이지')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('surface').props.style)).toMatchObject({
      backgroundColor: colors.panel,
      borderColor: colors.panelBorder,
      shadowColor: shadows.soft.shadowColor,
    });
  });

  test('renders stat pills and progress meters with stable labels', () => {
    render(
      <>
        <StatPill label="공부" value="45분" tone="study" />
        <ProgressMeter label="진행도" value={45} max={60} />
      </>,
    );

    expect(screen.getByText('공부')).toBeTruthy();
    expect(screen.getByText('45분')).toBeTruthy();
    expect(screen.getByText('진행도')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
  });

  test('renders an icon button with an accessible label', () => {
    const onPress = jest.fn();

    render(<IconButton label="도감 열기" symbol="★" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: '도감 열기' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
