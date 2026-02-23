import React from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { DestinationMarkers } from './DestinationMarkers';
import { regionFromCoords } from '../utils/geo';
import { getLatitudeDeltaForMode } from '../utils/modeConfig';
import { useUIStore } from '@/stores/useUIStore';
import type { DepartureTime, Destination, DistanceMode } from '@/shared/types';

interface MapViewContainerProps {
  mapRef: React.RefObject<MapView | null>;
  userLat: number;
  userLng: number;
  mode: DistanceMode;
  destinations: Destination[];
  highlightedId: string | null;
  departureTime: DepartureTime;
  onMarkerPress: (destination: Destination) => void;
}

export function MapViewContainer({
  mapRef,
  userLat,
  userLng,
  mode,
  destinations,
  highlightedId,
  departureTime,
  onMarkerPress,
}: MapViewContainerProps) {
  const setMapInteracting = useUIStore((s) => s.setMapInteracting);
  const delta = getLatitudeDeltaForMode(mode);
  const initialRegion = regionFromCoords(userLat, userLng, delta);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      onPanDrag={() => setMapInteracting(true)}
      onRegionChangeComplete={() => setMapInteracting(false)}
    >
      <DestinationMarkers
        destinations={destinations}
        highlightedId={highlightedId}
        departureTime={departureTime}
        onMarkerPress={onMarkerPress}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
