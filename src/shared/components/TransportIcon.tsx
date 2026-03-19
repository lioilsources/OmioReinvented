import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { TransportType } from '@/shared/types';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  train: 'train',
  bus: 'bus',
  flixbus: 'bus',
  flight: 'airplane',
  tram: 'train-outline',
  scooter: 'bicycle',
  ferry: 'boat',
};

interface TransportIconProps {
  type: TransportType | string;
  size?: number;
  color?: string;
}

export function TransportIcon({ type, size = 16, color = '#5C6B7A' }: TransportIconProps) {
  const icon = icons[type] ?? 'help-circle-outline';
  return <Ionicons name={icon} size={size} color={color} />;
}
