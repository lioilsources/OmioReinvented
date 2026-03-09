import { useMemo } from 'react';
import type { Destination } from '@/shared/types';

export interface PoiTypeEntry {
  type: string;
  count: number;
}

export function usePoiTypes(destinations: Destination[], maxTypes = 10): PoiTypeEntry[] {
  return useMemo(() => {
    const counts = new Map<string, number>();
    for (const dest of destinations) {
      for (const type of dest.poiTypes ?? []) {
        counts.set(type, (counts.get(type) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxTypes);
  }, [destinations, maxTypes]);
}
