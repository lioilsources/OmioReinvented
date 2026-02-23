import { apiGet } from './client';
import type { Journey, TimeMode } from '@/shared/types';

export function searchJourneys(
  destinationId: string,
  timeMode: TimeMode
): Promise<Journey[]> {
  return apiGet<Journey[]>('/api/journeys', { destinationId, timeMode });
}
