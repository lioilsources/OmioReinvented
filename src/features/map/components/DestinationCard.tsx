import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { TransportIcon } from '@/shared/components/TransportIcon';
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
  return (
    <Pressable
      style={[styles.card, highlighted && styles.cardHighlighted]}
      onPress={onPress}
    >
      <Image source={{ uri: destination.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {destination.name}
          </Text>
          <Text style={styles.country}>{destination.country}</Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.transports}>
            {destination.transportTypes.map((t) => (
              <TransportIcon key={t} type={t} size={14} />
            ))}
          </View>
          <Text style={styles.price}>from €{destination.priceFrom}</Text>
        </View>
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
  image: {
    width: 80,
    height: 80,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transports: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
});
