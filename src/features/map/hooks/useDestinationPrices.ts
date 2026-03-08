import { useQuery } from '@tanstack/react-query';
import { getDiscoveryPrice } from '@/api/discovery';
import { TRAVEL_MODES } from '@/api/config';
import type { Destination, DistanceMode } from '@/shared/types';

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useDestinationPrices(
  destinations: Destination[],
  distanceMode: DistanceMode,
  fromId: string,
) {
  const ids = destinations.map((d) => d.id).sort().join(',');

  return useQuery({
    queryKey: ['prices', fromId, ids, distanceMode],
    queryFn: async (): Promise<Map<string, number>> => {
      const travelModes = TRAVEL_MODES[distanceMode];
      const date = getTomorrowDate();

      const results = await Promise.allSettled(
        destinations.map(async (dest) => {
          const price = await getDiscoveryPrice(fromId, dest.id, date, travelModes);
          return { id: dest.id, price };
        }),
      );

      const priceMap = new Map<string, number>();
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.price !== null) {
          priceMap.set(result.value.id, result.value.price);
        }
      }
      return priceMap;
    },
    enabled: destinations.length > 0,
    staleTime: 120_000,
  });
}
