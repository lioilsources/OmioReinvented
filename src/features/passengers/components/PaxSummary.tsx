import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/shared/constants/theme';

interface PaxSummaryProps {
  summary: string;
  totalPrice: number;
}

export function PaxSummary({ summary, totalPrice }: PaxSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Total group price:</Text>
        <Text style={styles.price}>€{totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    gap: spacing.xs,
  },
  summary: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '500',
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
});
