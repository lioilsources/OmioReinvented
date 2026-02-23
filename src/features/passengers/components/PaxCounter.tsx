import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';

interface PaxCounterProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function PaxCounter({
  label,
  value,
  min = 0,
  max = 9,
  onIncrement,
  onDecrement,
}: PaxCounterProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          style={[styles.btn, value <= min && styles.btnDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
        >
          <Text style={[styles.btnText, value <= min && styles.btnTextDisabled]}>
            −
          </Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          style={[styles.btn, value >= max && styles.btnDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
        >
          <Text style={[styles.btnText, value >= max && styles.btnTextDisabled]}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    borderColor: colors.border,
  },
  btnText: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  btnTextDisabled: {
    color: colors.border,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
});
