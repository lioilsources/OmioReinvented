import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { DestinationMarkers } from './DestinationMarkers';
import { regionFromCoords } from '../utils/geo';
import { getLatitudeDeltaForMode } from '../utils/modeConfig';
import { useUIStore } from '@/stores/useUIStore';
import type { Destination, DistanceMode, MapBounds } from '@/shared/types';

interface MapViewContainerProps {
  mapRef: React.RefObject<MapView | null>;
  userLat: number;
  userLng: number;
  mode: DistanceMode;
  destinations: Destination[];
  highlightedId: string | null;
  onMarkerPress: (destination: Destination) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}

function regionToBounds(region: Region): MapBounds {
  return {
    northLat: region.latitude + region.latitudeDelta / 2,
    southLat: region.latitude - region.latitudeDelta / 2,
    westLon: region.longitude - region.longitudeDelta / 2,
    eastLon: region.longitude + region.longitudeDelta / 2,
  };
}

export function MapViewContainer({
  mapRef,
  userLat,
  userLng,
  mode,
  destinations,
  highlightedId,
  onMarkerPress,
  onBoundsChange,
}: MapViewContainerProps) {
  const setMapInteracting = useUIStore((s) => s.setMapInteracting);
  const delta = getLatitudeDeltaForMode(mode);
  const initialRegion = regionFromCoords(userLat, userLng, delta);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setMapInteracting(false);
      onBoundsChange(regionToBounds(region));
    },
    [setMapInteracting, onBoundsChange],
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      onPanDrag={() => setMapInteracting(true)}
      onRegionChangeComplete={handleRegionChangeComplete}
    >
      <DestinationMarkers
        destinations={destinations}
        highlightedId={highlightedId}
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
