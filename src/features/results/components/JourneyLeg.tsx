import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransportIcon } from '@/shared/components/TransportIcon';
import { colors, fontSize, spacing } from '@/shared/constants/theme';
import type { JourneyLeg as JourneyLegType } from '@/shared/types';

interface JourneyLegProps {
  leg: JourneyLegType;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function JourneyLeg({ leg }: JourneyLegProps) {
  return (
    <View style={styles.leg}>
      <TransportIcon type={leg.transportType} size={14} />
      <Text style={styles.text}>
        {leg.from} → {leg.to}
      </Text>
      <Text style={styles.time}>
        {formatTime(leg.departure)} – {formatTime(leg.arrival)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
