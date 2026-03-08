import { useQuery } from '@tanstack/react-query';
import { getPositions } from '@/api/positions';
import type { Destination, DistanceMode, MapBounds } from '@/shared/types';

function boundsKey(b: MapBounds) {
  // Round to 2 decimals so small pans don't re-fetch
  return [
    b.northLat.toFixed(2),
    b.southLat.toFixed(2),
    b.westLon.toFixed(2),
    b.eastLon.toFixed(2),
  ].join(',');
}

export function usePositions(bounds: MapBounds | null, mode: DistanceMode) {
  return useQuery({
    queryKey: ['positions', bounds ? boundsKey(bounds) : 'none', mode],
    queryFn: async (): Promise<Destination[]> => {
      if (!bounds) return [];
      const positions = await getPositions(bounds, mode);
      return positions.map((p) => ({
        id: p.id,
        name: p.translatedName || p.name,
        lat: p.latitude,
        lng: p.longitude,
        country: p.countryCode,
        priceFrom: null,
        population: p.population,
      }));
    },
    enabled: !!bounds,
    staleTime: 60_000,
  });
}
