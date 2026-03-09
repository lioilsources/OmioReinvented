import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '@/shared/constants/theme';
import type { DepartureTime } from '@/shared/types';

interface DaytimeSliderProps {
  value: DepartureTime;
  onChange: (value: DepartureTime) => void;
}

const options: { key: DepartureTime; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'morning', icon: 'sunny' },
  { key: 'afternoon', icon: 'partly-sunny' },
  { key: 'evening', icon: 'moon' },
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
            <Ionicons name={opt.icon} size={18} color={active ? colors.chipTextActive : colors.text} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    top: '25%',
    zIndex: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  option: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  optionActive: {
    backgroundColor: colors.chipActive,
  },
});
