import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { triggerSearch, pollSearchResults } from '@/api/search';
import type { SearchResponse } from '@/api/search';
import { mapSearchResponse } from '@/api/searchMapper';
import type { Journey } from '@/shared/types';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

interface UseSearchPollingOptions {
  fromId: string;
  toId: string;
  travelModes: string[];
  enabled: boolean;
}

export function useSearchPolling({
  fromId,
  toId,
  travelModes,
  enabled,
}: UseSearchPollingOptions) {
  const [searchId, setSearchId] = useState<string | null>(null);
  const [initialResponse, setInitialResponse] = useState<SearchResponse | null>(null);
  const [triggerError, setTriggerError] = useState<Error | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const pollCountRef = useRef(0);
  const modesKey = travelModes.join(',');

  // Reset when inputs change or disabled
  useEffect(() => {
    setSearchId(null);
    setInitialResponse(null);
    setTriggerError(null);
    setIsTriggering(false);
    pollCountRef.current = 0;
  }, [fromId, toId, modesKey, enabled]);

  // Step 1: Trigger search
  useEffect(() => {
    if (!enabled || !fromId || !toId || searchId) return;
    let cancelled = false;
    setIsTriggering(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    const dateISO = tomorrow.toISOString();

    triggerSearch(fromId, toId, dateISO, travelModes)
      .then((resp) => {
        if (cancelled) return;
        setSearchId(resp.searchId);
        setInitialResponse(resp);
        setIsTriggering(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setTriggerError(err);
        setIsTriggering(false);
      });

    return () => { cancelled = true; };
  }, [enabled, fromId, toId, modesKey, searchId]);

  // Step 2: Poll if status is running
  const needsPolling = initialResponse?.status === 'running' || initialResponse?.status === 'queued';

  const {
    data: pollResponse,
    error: pollError,
  } = useQuery({
    queryKey: ['search-poll', searchId],
    queryFn: () => {
      pollCountRef.current++;
      return pollSearchResults(searchId!);
    },
    enabled: !!searchId && needsPolling,
    refetchInterval: (query) => {
      if (pollCountRef.current >= MAX_POLLS) return false;
      const data = query.state.data as SearchResponse | undefined;
      if (data?.status === 'done') return false;
      return POLL_INTERVAL_MS;
    },
    staleTime: 0,
  });

  // Use poll response if available, otherwise initial
  const latestResponse = pollResponse ?? initialResponse;

  const journeys = useMemo<Journey[]>(() => {
    if (!latestResponse) return [];
    return mapSearchResponse(latestResponse);
  }, [latestResponse]);

  const isComplete = latestResponse?.status === 'done';
  const isPolling = isTriggering || (!!searchId && !isComplete);

  return {
    journeys,
    isPolling,
    isComplete,
    error: triggerError || pollError,
  };
}
