import { useQuery } from '@tanstack/react-query';
import { searchJourneys, browseJourneys } from '@/api/journeys';
import { useSearchStore } from '@/stores/useSearchStore';
import type { Destination } from '@/shared/types';

export function useJourneys(destinations: Destination[] = []) {
  const destination = useSearchStore((s) => s.destination);
  const timeMode = useSearchStore((s) => s.timeMode);
  const distanceMode = useSearchStore((s) => s.distanceMode);

  const isBrowse = !destination;

  return useQuery({
    queryKey: isBrowse
      ? ['journeys', 'browse', distanceMode]
      : ['journeys', destination.id, timeMode],
    queryFn: () =>
      isBrowse
        ? browseJourneys(destinations, distanceMode)
        : searchJourneys(destination, timeMode!, distanceMode),
    enabled: isBrowse ? destinations.length > 0 : !!timeMode,
  });
}
