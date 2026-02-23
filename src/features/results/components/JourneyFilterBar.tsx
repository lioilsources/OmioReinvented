import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from '@/shared/components/Chip';
import { spacing } from '@/shared/constants/theme';
import type { SortMode } from '../hooks/useJourneySort';

interface JourneyFilterBarProps {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

export function JourneyFilterBar({
  sortMode,
  onSortChange,
}: JourneyFilterBarProps) {
  return (
    <View style={styles.bar}>
      <Chip
        label="Cheapest"
        active={sortMode === 'cheapest'}
        onPress={() => onSortChange('cheapest')}
      />
      <Chip
        label="Fastest"
        active={sortMode === 'fastest'}
        onPress={() => onSortChange('fastest')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
