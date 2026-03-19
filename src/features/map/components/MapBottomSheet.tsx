import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { DestinationList } from './DestinationList';
import { JourneySheet } from './JourneySheet';
import { TimeSheet } from '@/features/time/components/TimeSheet';
import { PaxSheet } from '@/features/passengers/components/PaxSheet';
import { useUIStore, type ActiveSheet } from '@/stores/useUIStore';
import { colors, borderRadius } from '@/shared/constants/theme';
import type { Destination, Journey } from '@/shared/types';

interface MapBottomSheetProps {
  destinations: Destination[];
  highlightedId: string | null;
  onSelectDestination: (destination: Destination) => void;
  loading: boolean;
  journeys: Journey[];
  isPolling: boolean;
  destination: Destination | null;
  originName: string;
}

export function MapBottomSheet({
  destinations,
  highlightedId,
  onSelectDestination,
  loading,
  journeys,
  isPolling,
  destination,
  originName,
}: MapBottomSheetProps) {
  const activeSheet = useUIStore((s) => s.activeSheet);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => {
    if (activeSheet === 'destinations') return ['15%', '50%', '90%'];
    if (activeSheet === 'journeys') return ['25%', '60%', '90%'];
    return ['40%', '70%'];
  }, [activeSheet]);

  const handleSheetChange = useCallback((index: number) => {
    // Could track sheet position if needed
  }, []);

  const renderContent = () => {
    switch (activeSheet) {
      case 'destinations':
        return (
          <DestinationList
            destinations={destinations}
            highlightedId={highlightedId}
            onSelect={onSelectDestination}
            loading={loading}
          />
        );
      case 'journeys':
        return (
          <JourneySheet
            journeys={journeys}
            isPolling={isPolling}
            destination={destination}
            originName={originName}
          />
        );
      case 'time':
        return <TimeSheet />;
      case 'pax':
        return <PaxSheet />;
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={activeSheet === 'destinations' ? 0 : 1}
      onChange={handleSheetChange}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      {renderContent()}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  indicator: {
    backgroundColor: colors.border,
    width: 40,
  },
});
