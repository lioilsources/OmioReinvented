import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '@/shared/constants/theme';
import { getPoiIcon } from '../utils/poiConfig';
import type { PoiTypeEntry } from '../hooks/usePoiTypes';

interface PoiTypeSliderProps {
  poiTypes: PoiTypeEntry[];
  selectedType: string | null;
  onSelect: (type: string | null) => void;
}

export function PoiTypeSlider({ poiTypes, selectedType, onSelect }: PoiTypeSliderProps) {
  if (poiTypes.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {poiTypes.map((entry) => {
          const active = entry.type === selectedType;
          return (
            <Pressable
              key={entry.type}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => onSelect(active ? null : entry.type)}
            >
              <Ionicons
                name={getPoiIcon(entry.type)}
                size={18}
                color={active ? colors.chipTextActive : colors.text}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 8,
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
    maxHeight: 400,
  },
  scroll: {
    flexGrow: 0,
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
