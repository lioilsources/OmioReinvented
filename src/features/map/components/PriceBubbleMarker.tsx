import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors, borderRadius, fontSize, spacing } from '@/shared/constants/theme';
import type { Destination } from '@/shared/types';

interface PriceBubbleMarkerProps {
  destination: Destination;
  highlighted: boolean;
  onPress: () => void;
}

export function PriceBubbleMarker({
  destination,
  highlighted,
  onPress,
}: PriceBubbleMarkerProps) {
  const priceLabel =
    destination.priceFrom !== null ? `€${destination.priceFrom}` : '...';

  return (
    <Marker
      coordinate={{ latitude: destination.lat, longitude: destination.lng }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.bubble, highlighted && styles.bubbleHighlighted]}>
        <Text style={[styles.name, highlighted && styles.nameHighlighted]}>
          {destination.name}
        </Text>
        <Text style={[styles.price, highlighted && styles.priceHighlighted]}>
          {priceLabel}
        </Text>
      </View>
      <View style={[styles.arrow, highlighted && styles.arrowHighlighted]} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.priceBubble,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleHighlighted: {
    backgroundColor: colors.priceBubble,
    borderColor: colors.primaryDark,
  },
  name: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  nameHighlighted: {
    color: colors.priceBubbleText,
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.priceBubble,
  },
  priceHighlighted: {
    color: colors.priceBubbleText,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.priceBubble,
    alignSelf: 'center',
  },
  arrowHighlighted: {
    borderTopColor: colors.primaryDark,
  },
});
