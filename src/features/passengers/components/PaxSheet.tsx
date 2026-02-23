import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { PaxCounter } from './PaxCounter';
import { ChildRow } from './ChildRow';
import { PaxSummary } from './PaxSummary';
import { SearchButton } from './SearchButton';
import { usePaxCalculation } from '../hooks/usePaxCalculation';
import { useSearchStore } from '@/stores/useSearchStore';
import { useUIStore } from '@/stores/useUIStore';
import { colors, fontSize, spacing } from '@/shared/constants/theme';

export function PaxSheet() {
  const router = useRouter();
  const { pax, totalPrice, summary } = usePaxCalculation();
  const setAdults = useSearchStore((s) => s.setAdults);
  const addChild = useSearchStore((s) => s.addChild);
  const removeChild = useSearchStore((s) => s.removeChild);
  const setChildAge = useSearchStore((s) => s.setChildAge);
  const setActiveSheet = useUIStore((s) => s.setActiveSheet);
  const destination = useSearchStore((s) => s.destination);
  const timeMode = useSearchStore((s) => s.timeMode);
  const setTimeMode = useSearchStore((s) => s.setTimeMode);

  const goBack = useCallback(() => {
    setActiveSheet('time');
  }, [setActiveSheet]);

  const handleSearch = useCallback(() => {
    router.push('/(tabs)/results');
  }, [router]);

  return (
    <BottomSheetScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>How many travelers?</Text>
        {destination && (
          <Text style={styles.subtitle}>
            To {destination.name}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <PaxCounter
          label="Adults"
          value={pax.adults}
          min={1}
          max={9}
          onIncrement={() => setAdults(pax.adults + 1)}
          onDecrement={() => setAdults(pax.adults - 1)}
        />

        {pax.children.map((child, index) => (
          <ChildRow
            key={index}
            index={index}
            age={child.age}
            onAgeChange={(age) => setChildAge(index, age)}
            onRemove={() => removeChild(index)}
          />
        ))}

        {pax.children.length < 6 && (
          <Pressable onPress={addChild} style={styles.addChild}>
            <Text style={styles.addChildText}>+ Add child</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <PaxSummary summary={summary} totalPrice={totalPrice} />
        <SearchButton onPress={handleSearch} totalPrice={totalPrice} />
      </View>
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
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  addChild: {
    paddingVertical: spacing.sm,
  },
  addChildText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
