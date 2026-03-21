import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { JourneyCard } from '@/features/results/components/JourneyCard';
import { JourneyFilterBar } from '@/features/results/components/JourneyFilterBar';
import { useJourneySort } from '@/features/results/hooks/useJourneySort';
import { colors, fontSize, spacing } from '@/shared/constants/theme';
import type { Destination, Journey } from '@/shared/types';

const VEHICLES: { icon: keyof typeof Ionicons.glyphMap }[] = [
  { icon: 'airplane' },
  { icon: 'train' },
  { icon: 'bus' },
  { icon: 'boat' },
];

function SearchAnimation() {
  const anims = VEHICLES.map(() => useRef(new Animated.Value(-1)).current);

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={animStyles.container}>
      <View style={animStyles.track}>
        {VEHICLES.map((v, i) => {
          const translateX = anims[i].interpolate({
            inputRange: [-1, 1],
            outputRange: [-30, 220],
          });
          const opacity = anims[i].interpolate({
            inputRange: [-1, -0.6, 0, 0.6, 1],
            outputRange: [0, 1, 1, 1, 0],
          });
          return (
            <Animated.View
              key={v.icon}
              style={[
                animStyles.iconWrap,
                { transform: [{ translateX }], opacity },
              ]}
            >
              <Ionicons name={v.icon} size={20} color={colors.primary} />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const animStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  track: {
    width: 220,
    height: 28,
    position: 'relative',
  },
  iconWrap: {
    position: 'absolute',
    top: 0,
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

      {isPolling && <SearchAnimation />}

      {journeys.length > 0 && (
        <JourneyFilterBar sortMode={sortMode} onSortChange={setSortMode} />
      )}

      <BottomSheetFlatList
        data={sorted}
        keyExtractor={(item: Journey) => item.id}
        renderItem={({ item }: { item: Journey }) => (
          <JourneyCard
            journey={item}
            onBuy={onJourneyPress ? () => onJourneyPress(item) : undefined}
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
