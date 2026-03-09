import type { DistanceMode, TransportType } from '@/shared/types';

interface ModeConfig {
  label: string;
  zoomDelta: number;
  radius: string;
  transports: TransportType[];
  discovery: {
    targetRadiusKm: number;
    grid: [number, number];
    maxApiPoints: number;
    maxUiPoints: number;
    boundsKeyStepDeg: number;
    sampleOverlapFactor: number;
    suppressionFactor: number;
  };
}

export const modeConfigs: Record<DistanceMode, ModeConfig> = {
  short: {
    label: 'Short',
    zoomDelta: 10.1,
    radius: '20km',
    transports: ['tram', 'bus', 'scooter'],
    discovery: {
      targetRadiusKm: 20,
      grid: [1, 1],
      maxApiPoints: 80,
      maxUiPoints: 8,
      boundsKeyStepDeg: 0.02,
      sampleOverlapFactor: 1.15,
      suppressionFactor: 0.35,
    },
  },
  medium: {
    label: 'Medium',
    zoomDelta: 6.2,
    radius: '300km',
    transports: ['train', 'flixbus'],
    discovery: {
      targetRadiusKm: 300,
      grid: [2, 3],
      maxApiPoints: 120,
      maxUiPoints: 12,
      boundsKeyStepDeg: 0.08,
      sampleOverlapFactor: 1.12,
      suppressionFactor: 0.5,
    },
  },
  long: {
    label: 'Long',
    zoomDelta: 4.5,
    radius: '1000km',
    transports: ['train', 'flight'],
    discovery: {
      targetRadiusKm: 1000,
      grid: [3, 4],
      maxApiPoints: 180,
      maxUiPoints: 15,
      boundsKeyStepDeg: 0.2,
      sampleOverlapFactor: 1.1,
      suppressionFactor: 0.6,
    },
  },
  'extra-long': {
    label: 'Extra',
    zoomDelta: 2.9,
    radius: '3000km',
    transports: ['flight'],
    discovery: {
      targetRadiusKm: 3000,
      grid: [4, 5],
      maxApiPoints: 260,
      maxUiPoints: 15,
      boundsKeyStepDeg: 0.5,
      sampleOverlapFactor: 1.08,
      suppressionFactor: 0.7,
    },
  },
};

export function getZoomForMode(mode: DistanceMode): number {
  return modeConfigs[mode].zoomDelta;
}

export function getLatitudeDeltaForMode(mode: DistanceMode): number {
  const zoom = modeConfigs[mode].zoomDelta;
  // Supports float zoom values for finer radius calibration per mode.
  return 360 / Math.pow(2, zoom);
}

export function getDiscoveryConfigForMode(mode: DistanceMode) {
  return modeConfigs[mode].discovery;
}
