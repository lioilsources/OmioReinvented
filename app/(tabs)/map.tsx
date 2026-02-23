import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapViewContainer } from '@/features/map/components/MapViewContainer';
import { ModeSelector } from '@/features/map/components/ModeSelector';
import { OriginPill } from '@/features/map/components/OriginPill';
import { MapBottomSheet } from '@/features/map/components/MapBottomSheet';
import { useMapCamera } from '@/features/map/hooks/useMapCamera';
import { useUserLocation } from '@/features/map/hooks/useUserLocation';
import { useDestinations } from '@/features/map/hooks/useDestinations';
import { useSearchStore } from '@/stores/useSearchStore';
import { useUIStore } from '@/stores/useUIStore';
import type { Destination, DistanceMode } from '@/shared/types';

export default function MapScreen() {
  const { lat, lng, loading: locationLoading } = useUserLocation();
  const { mapRef, animateToMode } = useMapCamera();

  const origin = useSearchStore((s) => s.origin);
  const distanceMode = useSearchStore((s) => s.distanceMode);
  const destination = useSearchStore((s) => s.destination);
  const setOrigin = useSearchStore((s) => s.setOrigin);
  const setDistanceMode = useSearchStore((s) => s.setDistanceMode);
  const setDestination = useSearchStore((s) => s.setDestination);
  const setActiveSheet = useUIStore((s) => s.setActiveSheet);

  const { data: destinations = [], isLoading } = useDestinations(distanceMode);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Update origin when location resolves
  useEffect(() => {
    if (!locationLoading) {
      setOrigin({ lat, lng, name: 'Prague' });
    }
  }, [locationLoading, lat, lng, setOrigin]);

  const handleModeChange = useCallback(
    (mode: DistanceMode) => {
      setDistanceMode(mode);
      setHighlightedId(null);
      animateToMode(origin.lat, origin.lng, mode);
    },
    [setDistanceMode, animateToMode, origin]
  );

  const handleMarkerPress = useCallback(
    (dest: Destination) => {
      setHighlightedId(dest.id);
    },
    []
  );

  const handleSelectDestination = useCallback(
    (dest: Destination) => {
      setDestination(dest);
      setHighlightedId(dest.id);
      setActiveSheet('time');
    },
    [setDestination, setActiveSheet]
  );

  return (
    <View style={styles.container}>
      <MapViewContainer
        mapRef={mapRef}
        userLat={origin.lat}
        userLng={origin.lng}
        mode={distanceMode}
        destinations={destinations}
        highlightedId={highlightedId}
        onMarkerPress={handleMarkerPress}
      />
      <ModeSelector
        activeMode={distanceMode}
        onModeChange={handleModeChange}
      />
      <OriginPill name={origin.name} />
      <MapBottomSheet
        destinations={destinations}
        highlightedId={highlightedId}
        onSelectDestination={handleSelectDestination}
        loading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
