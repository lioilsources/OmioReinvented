import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';
import type { DepartureTime } from '@/shared/types';

interface DaytimeSliderProps {
  value: DepartureTime;
  onChange: (value: DepartureTime) => void;
}

const options: { key: DepartureTime; icon: string; label: string }[] = [
  { key: 'morning', icon: '🌅', label: 'Ráno' },
  { key: 'afternoon', icon: '☀️', label: 'Odpoledne' },
  { key: 'evening', icon: '🌇', label: 'Večer' },
];

export function DaytimeSlider({ value, onChange }: DaytimeSliderProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={styles.icon}>{opt.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: '35%',
    zIndex: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  option: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 64,
  },
  optionActive: {
    backgroundColor: colors.chipActive,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  labelActive: {
    color: colors.chipTextActive,
  },
});
