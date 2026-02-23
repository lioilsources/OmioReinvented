import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from '@/shared/components/Chip';
import { modeConfigs } from '../utils/modeConfig';
import { spacing } from '@/shared/constants/theme';
import type { DistanceMode } from '@/shared/types';

const MODES: DistanceMode[] = ['short', 'medium', 'long', 'extra-long'];

interface ModeSelectorProps {
  activeMode: DistanceMode;
  onModeChange: (mode: DistanceMode) => void;
}

export function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {MODES.map((mode) => (
          <Chip
            key={mode}
            label={modeConfigs[mode].label}
            subtitle={modeConfigs[mode].radius}
            active={mode === activeMode}
            onPress={() => onModeChange(mode)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
