import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TimeModeChip } from './TimeModeChip';
import { timeModes, TIME_MODE_ORDER } from '../utils/dateRanges';
import { spacing } from '@/shared/constants/theme';
import type { Destination, TimeMode } from '@/shared/types';

interface TimeModeGridProps {
  destination: Destination;
  onSelect: (mode: TimeMode) => void;
}

export function TimeModeGrid({ destination, onSelect }: TimeModeGridProps) {
  return (
    <View style={styles.grid}>
      {TIME_MODE_ORDER.map((mode) => (
        <TimeModeChip
          key={mode}
          label={timeModes[mode].label}
          emoji={timeModes[mode].emoji}
          price={destination.prices_by_when[mode]}
          onPress={() => onSelect(mode)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
});
