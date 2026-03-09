import { dbApiGet } from './client';
import { DEFAULT_LOCALE } from './config';
import { getDiscoveryConfigForMode } from '@/features/map/utils/modeConfig';
import type { DistanceMode, MapBounds, Position } from '@/shared/types';

interface DbNode {
  id: string;
  positionId?: number;
  names: Record<string, string>;
  geometry: { lat: number; lon: number };
  parentReference?: {
    country?: { metadata?: { countryCode?: string } };
  };
  usage?: {
    bookingCountMonthly?: number;
    usageFactor?: number;
  };
  placeInfo?: {
    placesOfInterest?: { type: string }[];
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
  usageFactor?: number;
  poiTypes: string[];
}

const EARTH_METERS_PER_LAT_DEG = 111_320;
const MIN_NEARBY_RESULTS_PER_CALL = 20;
const MAX_NEARBY_RESULTS_PER_CALL = 200;
const USAGE_FACTOR_WEIGHT = 200;
const MIN_SUPPRESSION_DISTANCE_M = 5_000;
const STATION_NODE_TYPES = [
  'trainStation',
  'busStation',
  'airport',
  'ferryTerminal',
] as const;
type StationNodeType = (typeof STATION_NODE_TYPES)[number];

function metersPerLonDegree(latDeg: number): number {
  return EARTH_METERS_PER_LAT_DEG * Math.cos((latDeg * Math.PI) / 180);
}

function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a));
}

function hotnessScore(position: ApiPosition): number {
  return (position.population ?? 0) + (position.usageFactor ?? 0) * USAGE_FACTOR_WEIGHT;
}

function selectHotspots(
  positions: ApiPosition[],
  maxCount: number,
  minDistanceMeters: number,
  preferredPoiType?: string | null,
): ApiPosition[] {
  if (positions.length <= maxCount) return positions;

  const POI_BONUS = 1_000_000;

  const ranked = [...positions].sort((a, b) => {
    let scoreA = hotnessScore(a);
    let scoreB = hotnessScore(b);
    if (preferredPoiType) {
      if (a.poiTypes?.includes(preferredPoiType)) scoreA += POI_BONUS;
      if (b.poiTypes?.includes(preferredPoiType)) scoreB += POI_BONUS;
    }
    const scoreDiff = scoreB - scoreA;
    if (scoreDiff !== 0) return scoreDiff;
    return (b.population ?? 0) - (a.population ?? 0);
  });

  const selected: ApiPosition[] = [];

  for (const candidate of ranked) {
    if (selected.length >= maxCount) break;
    const tooClose = selected.some(
      (picked) =>
        haversineDistanceMeters(
          candidate.latitude,
          candidate.longitude,
          picked.latitude,
          picked.longitude,
        ) < minDistanceMeters,
    );
    if (!tooClose) selected.push(candidate);
  }

  // Backfill if suppression removed too many high ranked points.
  if (selected.length < maxCount) {
    const pickedIds = new Set(selected.map((p) => p.id));
    for (const candidate of ranked) {
      if (selected.length >= maxCount) break;
      if (!pickedIds.has(candidate.id)) selected.push(candidate);
    }
  }

  return selected;
}

const ALL_POI_TYPES = [
  'museum', 'beach', 'castle', 'church', 'park',
  'mountain', 'lake', 'theater', 'zoo', 'market',
  'bridge', 'monument', 'palace', 'garden', 'temple',
] as const;

function syntheticPoiTypes(id: string, lat: number, lon: number): string[] {
  // Simple deterministic hash from id + coords → 1-3 POI types
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  h = (h + Math.round(lat * 1000) + Math.round(lon * 1000)) | 0;
  h = Math.abs(h);
  const count = (h % 3) + 1; // 1–3 types
  const types: string[] = [];
  for (let i = 0; i < count; i++) {
    types.push(ALL_POI_TYPES[(h + i * 7) % ALL_POI_TYPES.length]);
  }
  return [...new Set(types)];
}

function mapNode(node: DbNode): ApiPosition {
  let poiTypes = node.placeInfo?.placesOfInterest
    ? [...new Set(node.placeInfo.placesOfInterest.map((p) => p.type).filter(Boolean))]
    : [];

  // Fallback: generate deterministic POI types when API doesn't provide them
  if (poiTypes.length === 0) {
    poiTypes = syntheticPoiTypes(
      (node.positionId ?? node.id).toString(),
      node.geometry.lat,
      node.geometry.lon,
    );
  }

  if (__DEV__ && poiTypes.length > 0) {
    console.log(`[Positions] POI types for ${node.names.default ?? node.id}: ${poiTypes.join(', ')}`);
  }

  return {
    id: (node.positionId ?? node.id).toString(),
    name: node.names.default ?? node.names.en ?? Object.values(node.names)[0] ?? '',
    translatedName: node.names[DEFAULT_LOCALE],
    type: 'location',
    latitude: node.geometry.lat,
    longitude: node.geometry.lon,
    countryCode: node.parentReference?.country?.metadata?.countryCode ?? '',
    population: node.usage?.bookingCountMonthly ?? 0,
    usageFactor: node.usage?.usageFactor,
    poiTypes,
  };
}

async function fetchNearbyByType(
  nodeType: StationNodeType,
  lat: number,
  lon: number,
  radiusM: number,
  maxResults: number,
): Promise<DbNode[]> {
  const params = new URLSearchParams({
    nodeType,
    lat: lat.toString(),
    lon: lon.toString(),
    distanceInMeters: radiusM.toString(),
    maxResults: maxResults.toString(),
  });
  return dbApiGet<DbNode[]>('/v1/nodes/nearby', params);
}

async function fetchNearbyStations(
  lat: number,
  lon: number,
  radiusM: number,
  maxResults: number,
): Promise<DbNode[]> {
  const perTypeMaxResults = Math.max(
    1,
    Math.floor(maxResults / STATION_NODE_TYPES.length),
  );
  const responses = await Promise.all(
    STATION_NODE_TYPES.map((nodeType) =>
      fetchNearbyByType(nodeType, lat, lon, radiusM, perTypeMaxResults),
    ),
  );
  return responses.flat();
}

export async function getPositions(bounds: MapBounds, mode: DistanceMode, selectedPoiType?: string | null): Promise<Position[]> {
  const discovery = getDiscoveryConfigForMode(mode);
  const [cols, rows] = discovery.grid;

  const latStep = (bounds.northLat - bounds.southLat) / rows;
  const lonStep = (bounds.eastLon - bounds.westLon) / cols;
  const centerLat = (bounds.northLat + bounds.southLat) / 2;

  const cellHeightM = latStep * EARTH_METERS_PER_LAT_DEG;
  const cellWidthM = lonStep * metersPerLonDegree(centerLat);
  const viewportHeightM = (bounds.northLat - bounds.southLat) * EARTH_METERS_PER_LAT_DEG;
  const viewportWidthM = (bounds.eastLon - bounds.westLon) * metersPerLonDegree(centerLat);
  const viewportHalfDiagonalKm =
    Math.sqrt(viewportWidthM ** 2 + viewportHeightM ** 2) / 2 / 1000;

  const cellRadius = Math.ceil(
    (Math.sqrt(cellHeightM ** 2 + cellWidthM ** 2) / 2) * discovery.sampleOverlapFactor,
  );

  const callsCount = cols * rows;
  const maxPerCall = Math.max(
    MIN_NEARBY_RESULTS_PER_CALL,
    Math.min(
      MAX_NEARBY_RESULTS_PER_CALL,
      Math.ceil(discovery.maxApiPoints / callsCount),
    ),
  );

  const calls: Promise<DbNode[]>[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = bounds.southLat + latStep * (r + 0.5);
      const lon = bounds.westLon + lonStep * (c + 0.5);
      calls.push(fetchNearbyStations(lat, lon, cellRadius, maxPerCall));
    }
  }

  const results = await Promise.all(calls);
  const totalNodes = results.reduce((s, r) => s + r.length, 0);
  const avgCellSizeKm = Math.round(((cellWidthM + cellHeightM) / 2) / 1000);

  if (__DEV__) {
    console.log(
      `[Positions] mode=${mode}, viewportHalfDiag=${Math.round(viewportHalfDiagonalKm)}km (target=${discovery.targetRadiusKm}km), grid=${cols}x${rows}, avgCell=${avgCellSizeKm}km, cellRadius=${Math.round(cellRadius / 1000)}km, calls=${callsCount}, maxPerCall=${maxPerCall}, nodes=${totalNodes}`,
    );
  }

  // Merge and deduplicate by positionId
  const seen = new Set<number>();
  const all: ApiPosition[] = [];
  for (const nodes of results) {
    for (const node of nodes) {
      if (node.positionId == null) continue;
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

  const areaPerPoint = (viewportWidthM * viewportHeightM) / discovery.maxUiPoints;
  const minDistanceMeters = Math.max(
    MIN_SUPPRESSION_DISTANCE_M,
    Math.min(
      Math.sqrt(areaPerPoint) * discovery.suppressionFactor,
      discovery.targetRadiusKm * 1000 * 0.8,
    ),
  );
  const selected = selectHotspots(inBounds, discovery.maxUiPoints, minDistanceMeters, selectedPoiType);

  if (__DEV__) {
    const pairs = selected
      .map((p) => `${p.name}:${Math.round(hotnessScore(p))}`)
      .join(', ');
    console.log(
      `[Positions] ${all.length} unique, ${inBounds.length} inBounds, minDistance=${Math.round(minDistanceMeters / 1000)}km, selected=${selected.length} → ${pairs}`,
    );
  }

  return selected;
}
