import { useQuery } from '@tanstack/react-query';
import { getPositions } from '@/api/positions';
import { getDiscoveryConfigForMode } from '../utils/modeConfig';
import type { Destination, DistanceMode, MapBounds } from '@/shared/types';

function quantize(value: number, step: number) {
  return Math.round(value / step) * step;
}

function boundsKey(b: MapBounds, mode: DistanceMode) {
  const step = getDiscoveryConfigForMode(mode).boundsKeyStepDeg;
  // Quantize by mode so short mode is sensitive, long modes are stable.
  return [
    quantize(b.northLat, step).toFixed(3),
    quantize(b.southLat, step).toFixed(3),
    quantize(b.westLon, step).toFixed(3),
    quantize(b.eastLon, step).toFixed(3),
  ].join(',');
}

export function usePositions(bounds: MapBounds | null, mode: DistanceMode, selectedPoiType?: string | null) {
  return useQuery({
    queryKey: ['positions', bounds ? boundsKey(bounds, mode) : 'none', mode, selectedPoiType ?? null],
    queryFn: async (): Promise<Destination[]> => {
      if (!bounds) return [];
      const positions = await getPositions(bounds, mode, selectedPoiType);
      return positions.map((p) => ({
        id: p.id,
        name: p.translatedName || p.name,
        lat: p.latitude,
        lng: p.longitude,
        country: p.countryCode,
        priceFrom: null,
        population: p.population,
        poiTypes: p.poiTypes,
      }));
    },
    enabled: !!bounds,
    staleTime: 60_000,
  });
}
