import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { JourneyCard } from '@/features/results/components/JourneyCard';
import { JourneyFilterBar } from '@/features/results/components/JourneyFilterBar';
import { useJourneySort } from '@/features/results/hooks/useJourneySort';
import { colors, fontSize, spacing, borderRadius } from '@/shared/constants/theme';
import type { Destination, Journey } from '@/shared/types';

function SearchProgressBar({ journeyCount }: { journeyCount: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Progress grows as results come in, caps at 90% until done
    const target = Math.min(0.9, 0.15 + journeyCount * 0.05);
    Animated.timing(progress, {
      toValue: target,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [journeyCount]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: false }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={progressStyles.track}>
      <Animated.View style={[progressStyles.fill, { width, opacity: pulse }]} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

interface JourneySheetProps {
  journeys: Journey[];
  isPolling: boolean;
  destination: Destination | null;
  originName: string;
  onJourneyPress?: (journey: Journey) => void;
}

export function JourneySheet({
  journeys,
  isPolling,
  destination,
  originName,
  onJourneyPress,
}: JourneySheetProps) {
  const { sorted, sortMode, setSortMode } = useJourneySort(journeys, 'cheapest');

  if (!destination) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Select a destination on the map</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.route} numberOfLines={1}>
          {originName} → {destination.name}
        </Text>
        <Text style={styles.subtitle}>
          {isPolling
            ? `Searching... (${journeys.length} found)`
            : `${journeys.length} journeys`}
        </Text>
      </View>

      {isPolling && <SearchProgressBar journeyCount={journeys.length} />}

      {journeys.length > 0 && (
        <JourneyFilterBar sortMode={sortMode} onSortChange={setSortMode} />
      )}

      <BottomSheetFlatList
        data={sorted}
        keyExtractor={(item: Journey) => item.id}
        renderItem={({ item }: { item: Journey }) => (
          <JourneyCard
            journey={item}
            onPress={onJourneyPress ? () => onJourneyPress(item) : undefined}
          />
        )}
        ListEmptyComponent={
          isPolling ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Searching for journeys...</Text>
            </View>
          ) : null
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
