import { useQuery } from '@tanstack/react-query';
import { searchJourneys } from '@/api/journeys';
import { useSearchStore } from '@/stores/useSearchStore';

export function useJourneys() {
  const destination = useSearchStore((s) => s.destination);
  const timeMode = useSearchStore((s) => s.timeMode);

  return useQuery({
    queryKey: ['journeys', destination?.id, timeMode],
    queryFn: () => searchJourneys(destination!.id, timeMode!),
    enabled: !!destination && !!timeMode,
  });
}
