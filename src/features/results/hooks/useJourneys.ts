import { useQuery } from '@tanstack/react-query';
import { searchJourneys, browseJourneys } from '@/api/journeys';
import { useSearchStore } from '@/stores/useSearchStore';

export function useJourneys() {
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
        ? browseJourneys(distanceMode)
        : searchJourneys(destination.id, timeMode!),
    enabled: isBrowse || !!timeMode,
  });
}
