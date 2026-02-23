import React, { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { DestinationCard } from './DestinationCard';
import { colors, fontSize, spacing } from '@/shared/constants/theme';
import type { Destination } from '@/shared/types';

interface DestinationListProps {
  destinations: Destination[];
  highlightedId: string | null;
  onSelect: (destination: Destination) => void;
  loading: boolean;
}

export function DestinationList({
  destinations,
  highlightedId,
  onSelect,
  loading,
}: DestinationListProps) {
  const listRef = useRef<any>(null);
  const sorted = [...destinations].sort((a, b) => b.popularity - a.popularity);

  useEffect(() => {
    if (highlightedId && listRef.current) {
      const index = sorted.findIndex((d) => d.id === highlightedId);
      if (index >= 0) {
        listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
      }
    }
  }, [highlightedId, sorted]);

  const renderItem = useCallback(
    ({ item }: { item: Destination }) => (
      <DestinationCard
        destination={item}
        highlighted={item.id === highlightedId}
        onPress={() => onSelect(item)}
      />
    ),
    [highlightedId, onSelect]
  );

  if (loading) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading destinations...</Text>
      </View>
    );
  }

  return (
    <BottomSheetFlatList
      ref={listRef}
      data={sorted}
      keyExtractor={(item: Destination) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      onScrollToIndexFailed={() => {}}
      ListHeaderComponent={
        <Text style={styles.header}>
          {sorted.length} destinations
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xl,
  },
  header: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
