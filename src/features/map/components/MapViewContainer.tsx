import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { DestinationMarkers } from './DestinationMarkers';
import { regionFromCoords, haversineKm } from '../utils/geo';
import { getLatitudeDeltaForMode } from '../utils/modeConfig';
import { mutedMapStyle } from '../utils/mapStyle';
import { useUIStore } from '@/stores/useUIStore';
import { colors, fontSize, borderRadius, spacing } from '@/shared/constants/theme';
import type { Destination, DistanceMode, MapBounds } from '@/shared/types';

interface MapViewContainerProps {
  mapRef: React.RefObject<MapView | null>;
  userLat: number;
  userLng: number;
  mode: DistanceMode;
  destinations: Destination[];
  highlightedId: string | null;
  highlightedDuration: number | null;
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

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function MapViewContainer({
  mapRef,
  userLat,
  userLng,
  mode,
  destinations,
  highlightedId,
  highlightedDuration,
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

  const routeLabel = useMemo(() => {
    if (!highlightedDest) return null;
    const distKm = haversineKm(userLat, userLng, highlightedDest.lat, highlightedDest.lng);
    return {
      midLat: (userLat + highlightedDest.lat) / 2,
      midLng: (userLng + highlightedDest.lng) / 2,
      distText: `${Math.round(distKm)} km`,
      durationText: highlightedDuration ? formatDuration(highlightedDuration) : null,
    };
  }, [highlightedDest, highlightedDuration, userLat, userLng]);

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
      {routeLabel && highlightedId && (
        <Marker
          key={`route-label-${highlightedId}`}
          coordinate={{ latitude: routeLabel.midLat, longitude: routeLabel.midLng }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.routeLabel}>
            <Text style={styles.routeLabelText}>{routeLabel.distText}</Text>
            {routeLabel.durationText && (
              <Text style={styles.routeLabelText}>{routeLabel.durationText}</Text>
            )}
          </View>
        </Marker>
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
  routeLabel: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.routeLine,
  },
  routeLabelText: {
    color: colors.routeLine,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
