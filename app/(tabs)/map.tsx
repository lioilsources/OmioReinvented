import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapViewContainer } from '@/features/map/components/MapViewContainer';
import { ModeSelector } from '@/features/map/components/ModeSelector';
import { DaytimeSlider } from '@/features/map/components/DaytimeSlider';
import { PoiTypeSlider } from '@/features/map/components/PoiTypeSlider';
import { OriginPill } from '@/features/map/components/OriginPill';
import { MapBottomSheet } from '@/features/map/components/MapBottomSheet';
import { useMapCamera } from '@/features/map/hooks/useMapCamera';
import { useUserLocation } from '@/features/map/hooks/useUserLocation';
import { usePositions } from '@/features/map/hooks/usePositions';
import { useDestinationPrices } from '@/features/map/hooks/useDestinationPrices';
import { usePoiTypes } from '@/features/map/hooks/usePoiTypes';
import { useSearchStore, ORIGINS } from '@/stores/useSearchStore';
import type { Origin } from '@/stores/useSearchStore';
import { useUIStore } from '@/stores/useUIStore';
import type { Destination, DistanceMode, MapBounds } from '@/shared/types';

const BOUNDS_DEBOUNCE_MS = 500;

export default function MapScreen() {
  const { lat, lng, loading: locationLoading } = useUserLocation();
  const { mapRef, animateToMode } = useMapCamera();

  const origin = useSearchStore((s) => s.origin);
  const distanceMode = useSearchStore((s) => s.distanceMode);
  const destination = useSearchStore((s) => s.destination);
  const departureTime = useSearchStore((s) => s.departureTime);
  const setOrigin = useSearchStore((s) => s.setOrigin);
  const setDistanceMode = useSearchStore((s) => s.setDistanceMode);
  const setDestination = useSearchStore((s) => s.setDestination);
  const selectedPoiType = useSearchStore((s) => s.selectedPoiType);
  const setDepartureTime = useSearchStore((s) => s.setDepartureTime);
  const setSelectedPoiType = useSearchStore((s) => s.setSelectedPoiType);
  const setActiveSheet = useUIStore((s) => s.setActiveSheet);

  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBoundsChange = useCallback((newBounds: MapBounds) => {
    if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
    boundsTimerRef.current = setTimeout(() => {
      setBounds(newBounds);
    }, BOUNDS_DEBOUNCE_MS);
  }, []);

  const { data: rawDestinations = [], isLoading } = usePositions(bounds, distanceMode, selectedPoiType);
  const { data: priceMap } = useDestinationPrices(rawDestinations, distanceMode, origin.id);

  // Merge positions with prices for the active daytime bucket
  const destinations = useMemo<Destination[]>(() => {
    if (!priceMap) return rawDestinations;
    return rawDestinations.map((d) => {
      const daytimePrices = priceMap.get(d.id);
      const price = daytimePrices ? daytimePrices[departureTime] : null;
      return {
        ...d,
        priceFrom: price ?? d.priceFrom,
      };
    });
  }, [rawDestinations, priceMap, departureTime]);

  const poiTypes = usePoiTypes(destinations);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Set origin coords from user location on first load only
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!locationLoading && !initializedRef.current) {
      initializedRef.current = true;
      // Keep the default origin (Prague) — location is just used for initial map center
    }
  }, [locationLoading]);

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

  const handleOriginSelect = useCallback(
    (newOrigin: Origin) => {
      setOrigin(newOrigin);
      setDestination(null);
      setHighlightedId(null);
      setActiveSheet('destinations');
      animateToMode(newOrigin.lat, newOrigin.lng, distanceMode);
    },
    [setOrigin, setDestination, setActiveSheet, animateToMode, distanceMode]
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
        selectedPoiType={selectedPoiType}
        onMarkerPress={handleMarkerPress}
        onBoundsChange={handleBoundsChange}
      />
      <ModeSelector
        activeMode={distanceMode}
        onModeChange={handleModeChange}
      />
      <DaytimeSlider
        value={departureTime}
        onChange={setDepartureTime}
      />
      <PoiTypeSlider
        poiTypes={poiTypes}
        selectedType={selectedPoiType}
        onSelect={setSelectedPoiType}
      />
      <OriginPill name={origin.name} origins={ORIGINS} onSelect={handleOriginSelect} />
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
