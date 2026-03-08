import { apiGet } from './client';
import { DEFAULT_LOCALE, MAX_POSITIONS } from './config';
import type { MapBounds, Position } from '@/shared/types';

interface ApiPosition {
  id: string;
  name: string;
  translatedName?: string;
  type: string;
  latitude: number;
  longitude: number;
  countryCode: string;
}

export async function getPositions(bounds: MapBounds): Promise<Position[]> {
  const centerLat = (bounds.northLat + bounds.southLat) / 2;
  const centerLon = (bounds.westLon + bounds.eastLon) / 2;

  const all = await apiGet<ApiPosition[]>('/positions', {
    latitude: centerLat.toString(),
    longitude: centerLon.toString(),
    locale: DEFAULT_LOCALE,
    format: 'json',
  });

  if (__DEV__) console.log(`[Positions] ${all.length} total, types: ${[...new Set(all.map(p => p.type))].join(', ')}`);

  const filtered = all.filter(
    (p) =>
      p.latitude >= bounds.southLat &&
      p.latitude <= bounds.northLat &&
      p.longitude >= bounds.westLon &&
      p.longitude <= bounds.eastLon
  );

  return filtered.slice(0, MAX_POSITIONS);
}
