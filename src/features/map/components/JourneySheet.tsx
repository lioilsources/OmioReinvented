import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { JourneyCard } from '@/features/results/components/JourneyCard';
import { JourneyFilterBar } from '@/features/results/components/JourneyFilterBar';
import { useJourneySort } from '@/features/results/hooks/useJourneySort';
import { useUIStore } from '@/stores/useUIStore';
import { colors, fontSize, spacing } from '@/shared/constants/theme';
import type { Destination, Journey } from '@/shared/types';

interface JourneySheetProps {
  journeys: Journey[];
  isPolling: boolean;
  destination: Destination | null;
  originName: string;
}

export function JourneySheet({
  journeys,
  isPolling,
  destination,
  originName,
}: JourneySheetProps) {
  const setActiveSheet = useUIStore((s) => s.setActiveSheet);
  const { sorted, sortMode, setSortMode } = useJourneySort(journeys, 'timetable');

  const handleBack = () => {
    setActiveSheet('destinations');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <Text style={styles.backButton}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.route} numberOfLines={1}>
          {originName} → {destination?.name ?? ''}
        </Text>
        <Text style={styles.subtitle}>
          {isPolling
            ? `Searching... (${journeys.length} found)`
            : `${journeys.length} journeys`}
        </Text>
      </View>

      {journeys.length > 0 && (
        <JourneyFilterBar sortMode={sortMode} onSortChange={setSortMode} />
      )}

      <BottomSheetFlatList
        data={sorted}
        keyExtractor={(item: Journey) => item.id}
        renderItem={({ item }: { item: Journey }) => <JourneyCard journey={item} />}
        ListEmptyComponent={
          isPolling ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Searching for journeys...</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No journeys found</Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  backButton: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  route: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  empty: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
