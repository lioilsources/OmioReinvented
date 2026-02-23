import type { DistanceMode, TransportType } from '@/shared/types';

interface ModeConfig {
  label: string;
  zoomDelta: number;
  radius: string;
  transports: TransportType[];
}

export const modeConfigs: Record<DistanceMode, ModeConfig> = {
  short: {
    label: 'Short',
    zoomDelta: 9,
    radius: '20km',
    transports: ['tram', 'bus', 'scooter'],
  },
  medium: {
    label: 'Medium',
    zoomDelta: 6,
    radius: '300km',
    transports: ['train', 'flixbus'],
  },
  long: {
    label: 'Long',
    zoomDelta: 5,
    radius: 'Country',
    transports: ['train', 'flight'],
  },
  'extra-long': {
    label: 'Extra',
    zoomDelta: 3,
    radius: 'Continental',
    transports: ['flight'],
  },
};

export function getZoomForMode(mode: DistanceMode): number {
  return modeConfigs[mode].zoomDelta;
}

export function getLatitudeDeltaForMode(mode: DistanceMode): number {
  const zoom = modeConfigs[mode].zoomDelta;
  // Convert zoom level to latitude delta
  // zoom 3 ≈ 40°, zoom 5 ≈ 10°, zoom 8 ≈ 2°, zoom 12 ≈ 0.1°
  return 360 / Math.pow(2, zoom);
}
