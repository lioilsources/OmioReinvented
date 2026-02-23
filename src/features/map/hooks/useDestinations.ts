import { useQuery } from '@tanstack/react-query';
import { getDestinations } from '@/api/destinations';
import type { DistanceMode } from '@/shared/types';

export function useDestinations(mode: DistanceMode) {
  return useQuery({
    queryKey: ['destinations', mode],
    queryFn: () => getDestinations(mode),
  });
}
