import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';

interface SearchButtonProps {
  onPress: () => void;
  totalPrice: number;
}

export function SearchButton({ onPress, totalPrice }: SearchButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>Search journeys</Text>
      <Text style={styles.price}>€{totalPrice.toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  text: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
});
