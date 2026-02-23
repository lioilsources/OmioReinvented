import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';

interface TimeModeChipProps {
  label: string;
  emoji: string;
  price: number;
  onPress: () => void;
}

export function TimeModeChip({ label, emoji, price, onPress }: TimeModeChipProps) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.price}>€{price}/pax</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
});
