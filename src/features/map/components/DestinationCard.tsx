import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';
import type { Destination } from '@/shared/types';

interface DestinationCardProps {
  destination: Destination;
  highlighted: boolean;
  onPress: () => void;
}

export function DestinationCard({
  destination,
  highlighted,
  onPress,
}: DestinationCardProps) {
  const priceLabel =
    destination.priceFrom !== null ? `from €${destination.priceFrom}` : '...';

  return (
    <Pressable
      style={[styles.card, highlighted && styles.cardHighlighted]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {destination.name}
          </Text>
          <Text style={styles.country}>{destination.country}</Text>
        </View>
        <Text style={styles.price}>{priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  country: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});
