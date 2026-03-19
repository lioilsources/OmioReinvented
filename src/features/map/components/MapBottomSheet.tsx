import React, { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { JourneySheet } from './JourneySheet';
import { colors, borderRadius } from '@/shared/constants/theme';
import type { Destination, Journey } from '@/shared/types';

const SNAP_POINTS = ['15%', '50%', '90%'];

interface MapBottomSheetProps {
  journeys: Journey[];
  isPolling: boolean;
  destination: Destination | null;
  originName: string;
}

export function MapBottomSheet({
  journeys,
  isPolling,
  destination,
  originName,
}: MapBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChange = useCallback((index: number) => {
    // Could track sheet position if needed
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={SNAP_POINTS}
      index={0}
      onChange={handleSheetChange}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <JourneySheet
        journeys={journeys}
        isPolling={isPolling}
        destination={destination}
        originName={originName}
      />
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
