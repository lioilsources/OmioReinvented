import type { Region } from 'react-native-maps';

export function regionFromCoords(
  lat: number,
  lng: number,
  latDelta: number
): Region {
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: latDelta,
    longitudeDelta: latDelta * 0.8,
  };
}
