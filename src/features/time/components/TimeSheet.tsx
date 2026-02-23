import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { TimeModeGrid } from './TimeModeGrid';
import { useTimeSelection } from '../hooks/useTimeSelection';
import { colors, fontSize, spacing } from '@/shared/constants/theme';

export function TimeSheet() {
  const { destination, selectTime, goBack } = useTimeSelection();

  if (!destination) return null;

  return (
    <BottomSheetScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>When do you want to go?</Text>
        <Text style={styles.subtitle}>
          To {destination.name} · prices per person
        </Text>
      </View>
      <TimeModeGrid destination={destination} onSelect={selectTime} />
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  back: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
