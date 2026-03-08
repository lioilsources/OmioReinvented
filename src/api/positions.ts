import { dbApiGet } from './client';
import { DEFAULT_LOCALE, MAX_POSITIONS } from './config';
import type { DistanceMode, MapBounds, Position } from '@/shared/types';

interface DbNode {
  id: string;
  positionId: number;
  names: Record<string, string>;
  geometry: { lat: number; lon: number };
  parentReference?: {
    country?: { metadata?: { countryCode?: string } };
  };
  usage?: {
    bookingCountMonthly?: number;
    usageFactor?: number;
  };
}

interface ApiPosition {
  id: string;
  name: string;
  translatedName?: string;
  type: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  population?: number;
}

/** Grid [cols, rows] for sampling nearby calls across the viewport */
const MODE_GRID: Record<DistanceMode, [number, number]> = {
  short: [1, 1],        // 1 call
  medium: [2, 3],       // 6 calls
  long: [3, 3],         // 9 calls
  'extra-long': [4, 4], // 16 calls
};

/**
 * Pick up to maxCount positions spread across the map viewport using a grid.
 * Divides bounds into cells and picks one position per cell, then fills
 * remaining slots round-robin from cells with extras.
 */
function selectDistributed(
  positions: ApiPosition[],
  maxCount: number,
  bounds: MapBounds,
): ApiPosition[] {
  if (positions.length <= maxCount) return positions;

  const cols = Math.ceil(Math.sqrt(maxCount));
  const rows = Math.ceil(maxCount / cols);

  const latStep = (bounds.northLat - bounds.southLat) / rows;
  const lonStep = (bounds.eastLon - bounds.westLon) / cols;

  // Assign positions to grid cells
  const grid = new Map<string, ApiPosition[]>();
  for (const p of positions) {
    const row = Math.min(
      Math.floor((p.latitude - bounds.southLat) / latStep),
      rows - 1,
    );
    const col = Math.min(
      Math.floor((p.longitude - bounds.westLon) / lonStep),
      cols - 1,
    );
    const key = `${row},${col}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(p);
  }

  const result: ApiPosition[] = [];
  const selected = new Set<string>();

  // Sort each cell by population descending so we pick the biggest city
  for (const [, cellPositions] of grid) {
    cellPositions.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
  }

  // First pass: one per cell
  for (const [, cellPositions] of grid) {
    if (result.length >= maxCount) break;
    result.push(cellPositions[0]);
    selected.add(cellPositions[0].id);
  }

  // Fill remaining from cells with extras
  if (result.length < maxCount) {
    for (const [, cellPositions] of grid) {
      for (const p of cellPositions) {
        if (result.length >= maxCount) break;
        if (!selected.has(p.id)) {
          result.push(p);
          selected.add(p.id);
        }
      }
      if (result.length >= maxCount) break;
    }
  }

  return result;
}

function mapNode(node: DbNode): ApiPosition {
  return {
    id: node.positionId.toString(),
    name: node.names.default ?? node.names.en ?? Object.values(node.names)[0] ?? '',
    translatedName: node.names[DEFAULT_LOCALE],
    type: 'location',
    latitude: node.geometry.lat,
    longitude: node.geometry.lon,
    countryCode: node.parentReference?.country?.metadata?.countryCode ?? '',
    population: node.usage?.bookingCountMonthly ?? 0,
  };
}

async function fetchNearby(lat: number, lon: number, radiusM: number, maxResults: number): Promise<DbNode[]> {
  const params = new URLSearchParams({
    nodeType: 'location',
    lat: lat.toString(),
    lon: lon.toString(),
    distanceInMeters: radiusM.toString(),
    maxResults: maxResults.toString(),
  });
  return dbApiGet<DbNode[]>('/v1/nodes/nearby', params);
}

export async function getPositions(bounds: MapBounds, mode: DistanceMode): Promise<Position[]> {
  const [cols, rows] = MODE_GRID[mode];

  const latStep = (bounds.northLat - bounds.southLat) / rows;
  const lonStep = (bounds.eastLon - bounds.westLon) / cols;
  // Radius per sample: half-diagonal of one grid cell in meters (1° ≈ 111,320m)
  const cellRadius = Math.ceil(Math.sqrt(latStep ** 2 + lonStep ** 2) / 2 * 111_320);
  const maxPerCall = Math.min(200, Math.ceil(200 / (cols * rows)));

  const calls: Promise<DbNode[]>[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = bounds.southLat + latStep * (r + 0.5);
      const lon = bounds.westLon + lonStep * (c + 0.5);
      calls.push(fetchNearby(lat, lon, cellRadius, maxPerCall));
    }
  }

  const results = await Promise.all(calls);
  const totalNodes = results.reduce((s, r) => s + r.length, 0);

  if (__DEV__) console.log(`[Positions] ${cols}×${rows} grid, cellRadius=${Math.round(cellRadius / 1000)}km, ${totalNodes} nodes total`);

  // Merge and deduplicate by positionId
  const seen = new Set<number>();
  const all: ApiPosition[] = [];
  for (const nodes of results) {
    for (const node of nodes) {
      if (!seen.has(node.positionId)) {
        seen.add(node.positionId);
        all.push(mapNode(node));
      }
    }
  }

  const inBounds = all.filter(
    (p) =>
      p.latitude >= bounds.southLat &&
      p.latitude <= bounds.northLat &&
      p.longitude >= bounds.westLon &&
      p.longitude <= bounds.eastLon
  );

  const distributed = selectDistributed(inBounds, MAX_POSITIONS, bounds);

  if (__DEV__) {
    const pairs = distributed.map((p) => `${p.name}:${p.population ?? 0}`).join(', ');
    console.log(`[Positions] ${all.length} unique, ${inBounds.length} in bounds, ${distributed.length} selected → ${pairs}`);
  }

  return distributed;
}
