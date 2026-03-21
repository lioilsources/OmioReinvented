import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransportIcon } from '@/shared/components/TransportIcon';
import { JourneyLeg } from './JourneyLeg';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';
import type { Journey } from '@/shared/types';
import { useSearchStore } from '@/stores/useSearchStore';

interface JourneyCardProps {
  journey: Journey;
  onPress?: () => void;
  onBuy?: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function JourneyCard({ journey, onPress, onBuy }: JourneyCardProps) {
  const pax = useSearchStore((s) => s.pax);
  const getTotalPrice = useSearchStore((s) => s.getTotalPrice);
  const pricePerPax = journey.price;

  // Calculate total based on pax
  const adultCost = pax.adults * pricePerPax;
  const childCost = pax.children.reduce((sum, child) => {
    if (child.age < 6) return sum;
    if (child.age < 15) return sum + pricePerPax * 0.5;
    return sum + pricePerPax;
  }, 0);
  const totalPrice = Math.round((adultCost + childCost) * 100) / 100;

  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      {journey.destinationName && (
        <Text style={styles.route}>Prague → {journey.destinationName}</Text>
      )}
      <View style={styles.row}>
        <View style={styles.times}>
          <Text style={styles.time}>{formatTime(journey.departure)}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.time}>{formatTime(journey.arrival)}</Text>
        </View>
        <Text style={styles.duration}>{formatDuration(journey.duration)}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.providerRow}>
          <TransportIcon type={journey.transportType} size={16} />
          <Text style={styles.provider}>{journey.provider}</Text>
          {journey.legs.length > 1 && (
            <Text style={styles.transfers}>
              {journey.legs.length - 1} transfer
            </Text>
          )}
        </View>
        {onBuy ? (
          <Pressable style={styles.buyButton} onPress={onBuy}>
            <Text style={styles.buyPrice}>€{totalPrice.toFixed(2)}</Text>
            <Ionicons name="cart" size={14} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.priceCol}>
            <Text style={styles.price}>€{totalPrice.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {journey.legs.length > 1 && (
        <View style={styles.legs}>
          {journey.legs.map((leg, i) => (
            <JourneyLeg key={i} leg={leg} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  arrow: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  duration: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  provider: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  transfers: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  perPax: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  route: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  legs: {
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  buyPrice: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.lg,
  },
});
