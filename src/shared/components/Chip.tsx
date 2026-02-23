import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  subtitle?: string;
}

export function Chip({ label, active, onPress, subtitle }: ChipProps) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {subtitle != null && (
        <Text style={[styles.subtitle, active && styles.subtitleActive]}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.chipInactive,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.chipActive,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.chipTextInactive,
  },
  labelActive: {
    color: colors.chipTextActive,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subtitleActive: {
    color: colors.chipTextActive,
    opacity: 0.85,
  },
});
