import { apiGet } from './client';
import type { Destination, DistanceMode } from '@/shared/types';

export function getDestinations(mode: DistanceMode): Promise<Destination[]> {
  return apiGet<Destination[]>('/api/destinations', { mode });
}
