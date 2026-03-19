import { useMemo, useState } from 'react';
import type { Journey } from '@/shared/types';

export type SortMode = 'timetable' | 'cheapest' | 'fastest';

export function useJourneySort(journeys: Journey[] | undefined, defaultSort: SortMode = 'cheapest') {
  const [sortMode, setSortMode] = useState<SortMode>(defaultSort);

  const sorted = useMemo(() => {
    if (!journeys) return [];
    const copy = [...journeys];
    switch (sortMode) {
      case 'timetable':
        copy.sort((a, b) => a.departure.localeCompare(b.departure));
        break;
      case 'cheapest':
        copy.sort((a, b) => a.price - b.price);
        break;
      case 'fastest':
        copy.sort((a, b) => a.duration - b.duration);
        break;
    }
    return copy;
  }, [journeys, sortMode]);

  return { sorted, sortMode, setSortMode };
}
