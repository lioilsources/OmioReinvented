import { apiGet } from './client';
import type { DistanceMode, Journey, TimeMode } from '@/shared/types';

export function searchJourneys(
  destinationId: string,
  timeMode: TimeMode
): Promise<Journey[]> {
  return apiGet<Journey[]>('/api/journeys', { destinationId, timeMode });
}

export function browseJourneys(mode: DistanceMode): Promise<Journey[]> {
  return apiGet<Journey[]>('/api/journeys/browse', { mode });
}
