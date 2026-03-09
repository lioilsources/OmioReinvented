import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { DestinationMarkers } from './DestinationMarkers';
import { regionFromCoords } from '../utils/geo';
import { getLatitudeDeltaForMode } from '../utils/modeConfig';
import { mutedMapStyle } from '../utils/mapStyle';
import { useUIStore } from '@/stores/useUIStore';
import { colors } from '@/shared/constants/theme';
import type { Destination, DistanceMode, MapBounds } from '@/shared/types';

interface MapViewContainerProps {
  mapRef: React.RefObject<MapView | null>;
  userLat: number;
  userLng: number;
  mode: DistanceMode;
  destinations: Destination[];
  highlightedId: string | null;
  selectedPoiType: string | null;
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
  selectedPoiType,
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

  const highlightedDest = highlightedId
    ? destinations.find((d) => d.id === highlightedId)
    : null;

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mutedMapStyle}
      onPanDrag={() => setMapInteracting(true)}
      onRegionChangeComplete={handleRegionChangeComplete}
    >
      {highlightedDest && (
        <Polyline
          coordinates={[
            { latitude: userLat, longitude: userLng },
            { latitude: highlightedDest.lat, longitude: highlightedDest.lng },
          ]}
          strokeColor={colors.routeLine}
          strokeWidth={2.5}
        />
      )}
      <DestinationMarkers
        destinations={destinations}
        highlightedId={highlightedId}
        selectedPoiType={selectedPoiType}
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
