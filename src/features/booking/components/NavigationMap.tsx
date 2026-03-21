import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useUserLocation } from '@/features/map/hooks/useUserLocation';
import { useSearchStore } from '@/stores/useSearchStore';
import { mutedMapStyle } from '@/features/map/utils/mapStyle';
import { colors, fontSize, spacing, borderRadius } from '@/shared/constants/theme';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBL4LW69ATiIb3HrzpLI1_0JaL9oy5CQow';

const MAP_HEIGHT = 440;

interface NavigationMapProps {
  stationName: string;
  stationLat?: number;
  stationLng?: number;
}

interface RouteInfo {
  polyline: { latitude: number; longitude: number }[];
  endCoord?: { latitude: number; longitude: number };
  distance: string;
  duration: string;
}

function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export function NavigationMap({ stationName, stationLat, stationLng }: NavigationMapProps) {
  const mapRef = useRef<MapView>(null);
  const userLocation = useUserLocation();
  const origin = useSearchStore((s) => s.origin);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const userCoord = { latitude: userLocation.lat, longitude: userLocation.lng };

  // Priority: API position coords > Directions API resolved > city-center fallback
  const hasStationCoords = stationLat != null && stationLng != null;
  const fallbackCoord = { latitude: origin.lat, longitude: origin.lng };

  // Resolved station coord: from props, or from Directions API response, or city fallback
  const stationCoord = hasStationCoords
    ? { latitude: stationLat, longitude: stationLng }
    : (route?.endCoord ?? fallbackCoord);

  useEffect(() => {
    if (userLocation.loading) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const fetchDirections = async () => {
      try {
        const originStr = `${userLocation.lat},${userLocation.lng}`;
        // Use exact coords if available, otherwise let Google resolve by name
        const destStr = hasStationCoords
          ? `${stationLat},${stationLng}`
          : encodeURIComponent(stationName);
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=transit&key=${GOOGLE_MAPS_API_KEY}`;

        if (__DEV__) console.log('[NavigationMap] Fetching directions:', url);

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (__DEV__) console.log('[NavigationMap] Response status:', data.status);

        if (data.routes?.length > 0) {
          const leg = data.routes[0].legs[0];
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          const endLoc = leg.end_location;
          setRoute({
            polyline: points,
            endCoord: { latitude: endLoc.lat, longitude: endLoc.lng },
            distance: leg.distance.text,
            duration: leg.duration.text,
          });
        }
      } catch {
        // Directions unavailable — straight line fallback
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    fetchDirections();
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [userLocation.loading, userLocation.lat, userLocation.lng, stationLat, stationLng, stationName]);

  const fitMap = () => {
    mapRef.current?.fitToCoordinates([userCoord, stationCoord], {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: false,
    });
  };

  // Re-fit when route loads (station coord may refine from Directions API)
  useEffect(() => {
    if (!loading && !userLocation.loading) {
      mapRef.current?.fitToCoordinates([userCoord, stationCoord], {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  }, [loading, route]);

  if (userLocation.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const routeCoords = route?.polyline ?? [userCoord, stationCoord];

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={mutedMapStyle}
          showsMyLocationButton={false}
          onMapReady={fitMap}
        >
          <Marker
            coordinate={userCoord}
            title="You"
            pinColor={colors.primary}
          />
          <Marker
            coordinate={stationCoord}
            title={stationName}
            pinColor={colors.success}
          />
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.routeLine}
            strokeWidth={3}
          />
        </MapView>
      </View>

      {route ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            {route.distance} · {route.duration}
          </Text>
        </View>
      ) : !loading ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoTextLight}>
            Navigate to {stationName}
          </Text>
        </View>
      ) : (
        <View style={styles.infoRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  loadingContainer: {
    width: '100%',
    height: MAP_HEIGHT,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    width: '100%',
    height: MAP_HEIGHT,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  map: {
    width: '100%',
    height: MAP_HEIGHT,
  },
  infoRow: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoTextLight: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});
