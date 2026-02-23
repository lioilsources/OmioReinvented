import { useCallback } from 'react';
import { useSearchStore } from '@/stores/useSearchStore';
import { useUIStore } from '@/stores/useUIStore';
import type { TimeMode } from '@/shared/types';

export function useTimeSelection() {
  const destination = useSearchStore((s) => s.destination);
  const setTimeMode = useSearchStore((s) => s.setTimeMode);
  const setActiveSheet = useUIStore((s) => s.setActiveSheet);

  const selectTime = useCallback(
    (mode: TimeMode) => {
      setTimeMode(mode);
      setActiveSheet('pax');
    },
    [setTimeMode, setActiveSheet]
  );

  const goBack = useCallback(() => {
    setTimeMode(null);
    setActiveSheet('destinations');
  }, [setTimeMode, setActiveSheet]);

  return { destination, selectTime, goBack };
}
