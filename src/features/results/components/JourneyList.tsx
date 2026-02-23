import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { JourneyCard } from './JourneyCard';
import { JourneyFilterBar } from './JourneyFilterBar';
import { colors, fontSize, spacing } from '@/shared/constants/theme';
import type { Journey } from '@/shared/types';
import type { SortMode } from '../hooks/useJourneySort';

interface JourneyListProps {
  journeys: Journey[];
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  loading: boolean;
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>No journeys found</Text>
      <Text style={styles.emptyText}>
        Go back to explore and search for destinations
      </Text>
    </View>
  );
}

export function JourneyList({
  journeys,
  sortMode,
  onSortChange,
  loading,
}: JourneyListProps) {
  if (loading) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading journeys...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={journeys}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <JourneyCard journey={item} />}
      ListHeaderComponent={
        journeys.length > 0 ? (
          <JourneyFilterBar sortMode={sortMode} onSortChange={onSortChange} />
        ) : null
      }
      ListEmptyComponent={<EmptyState />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
