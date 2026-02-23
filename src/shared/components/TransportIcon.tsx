import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { TransportType } from '@/shared/types';

const icons: Record<TransportType, string> = {
  tram: '🚊',
  bus: '🚌',
  train: '🚆',
  flixbus: '🚍',
  flight: '✈️',
  scooter: '🛴',
};

interface TransportIconProps {
  type: TransportType;
  size?: number;
}

export function TransportIcon({ type, size = 16 }: TransportIconProps) {
  return <Text style={[styles.icon, { fontSize: size }]}>{icons[type]}</Text>;
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
