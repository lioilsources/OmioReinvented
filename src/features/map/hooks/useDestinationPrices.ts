import { useQuery } from '@tanstack/react-query';
import { getDiscoveryPricesByDaytime } from '@/api/discovery';
import type { DaytimePrices } from '@/api/discovery';
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
    queryFn: async (): Promise<Map<string, DaytimePrices>> => {
      const travelModes = TRAVEL_MODES[distanceMode];
      const date = getTomorrowDate();

      const results = await Promise.allSettled(
        destinations.map(async (dest) => {
          const prices = await getDiscoveryPricesByDaytime(fromId, dest.id, date, travelModes);
          return { id: dest.id, prices };
        }),
      );

      const priceMap = new Map<string, DaytimePrices>();
      let fulfilled = 0;
      let rejected = 0;
      for (const result of results) {
        if (result.status === 'fulfilled') {
          priceMap.set(result.value.id, result.value.prices);
          fulfilled++;
        } else {
          rejected++;
          if (__DEV__) console.log(`[Prices] rejected: ${result.reason}`);
        }
      }
      if (__DEV__) console.log(`[Prices] ${destinations.length} destinations, ${fulfilled} with prices, ${rejected} rejected`);
      return priceMap;
    },
    enabled: destinations.length > 0,
    staleTime: 120_000,
  });
}
