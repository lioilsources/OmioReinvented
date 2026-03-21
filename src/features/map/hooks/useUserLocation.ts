import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Křižíkova 237, 186 00 Praha 8-Karlín
const PRAGUE = { lat: 50.0928, lng: 14.4539 };

interface UserLocation {
  lat: number;
  lng: number;
  loading: boolean;
}

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({
    ...PRAGUE,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function getLocation() {
      // In dev, skip GPS (simulator returns wrong location) and use fallback
      if (__DEV__) {
        if (!cancelled) setLocation({ ...PRAGUE, loading: false });
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setLocation({ ...PRAGUE, loading: false });
          return;
        }

        // Try last known first (fast)
        const last = await Location.getLastKnownPositionAsync();
        if (last && !cancelled) {
          setLocation({
            lat: last.coords.latitude,
            lng: last.coords.longitude,
            loading: false,
          });
          return;
        }

        // Fall back to current position with timeout
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setLocation({
            lat: current.coords.latitude,
            lng: current.coords.longitude,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) setLocation({ ...PRAGUE, loading: false });
      }
    }

    getLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
