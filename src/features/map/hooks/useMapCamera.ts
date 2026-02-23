import { useCallback, useRef } from 'react';
import MapView from 'react-native-maps';
import { regionFromCoords } from '../utils/geo';
import { getLatitudeDeltaForMode } from '../utils/modeConfig';
import type { DistanceMode } from '@/shared/types';

export function useMapCamera() {
  const mapRef = useRef<MapView>(null);

  const animateToMode = useCallback(
    (lat: number, lng: number, mode: DistanceMode) => {
      const delta = getLatitudeDeltaForMode(mode);
      const region = regionFromCoords(lat, lng, delta);
      mapRef.current?.animateToRegion(region, 500);
    },
    []
  );

  const animateToPoint = useCallback(
    (lat: number, lng: number, latDelta?: number) => {
      const region = regionFromCoords(lat, lng, latDelta ?? 0.5);
      mapRef.current?.animateToRegion(region, 300);
    },
    []
  );

  return { mapRef, animateToMode, animateToPoint };
}
