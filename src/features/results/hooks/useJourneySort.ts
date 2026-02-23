import { useMemo, useState } from 'react';
import type { Journey } from '@/shared/types';

export type SortMode = 'cheapest' | 'fastest';

export function useJourneySort(journeys: Journey[] | undefined) {
  const [sortMode, setSortMode] = useState<SortMode>('cheapest');

  const sorted = useMemo(() => {
    if (!journeys) return [];
    const copy = [...journeys];
    if (sortMode === 'cheapest') {
      copy.sort((a, b) => a.price - b.price);
    } else {
      copy.sort((a, b) => a.duration - b.duration);
    }
    return copy;
  }, [journeys, sortMode]);

  return { sorted, sortMode, setSortMode };
}
