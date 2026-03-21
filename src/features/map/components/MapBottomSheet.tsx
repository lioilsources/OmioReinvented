import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { JourneySheet } from './JourneySheet';
import { BookingSheet } from '@/features/booking/components/BookingSheet';
import { useBookingFlow } from '@/features/booking/hooks/useBookingFlow';
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
  const [bookingJourney, setBookingJourney] = useState<Journey | null>(null);
  const booking = useBookingFlow();

  const handleSheetChange = useCallback((index: number) => {
    // Could track sheet position if needed
  }, []);

  const handleJourneyPress = useCallback(
    (journey: Journey) => {
      setBookingJourney(journey);
      bottomSheetRef.current?.snapToIndex(2); // expand to 90%
      booking.startBooking(journey);
    },
    [booking.startBooking],
  );

  const handleBookingCancel = useCallback(() => {
    booking.cancel();
    setBookingJourney(null);
    bottomSheetRef.current?.snapToIndex(1); // back to 50%
  }, [booking.cancel]);

  const handleBookingRetry = useCallback(() => {
    if (bookingJourney) {
      booking.startBooking(bookingJourney);
    }
  }, [bookingJourney, booking.startBooking]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={SNAP_POINTS}
      index={0}
      onChange={handleSheetChange}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      {bookingJourney ? (
        <BookingSheet
          phase={booking.phase}
          bookingId={booking.bookingId}
          error={booking.error}
          journeyProvider={bookingJourney.provider}
          stationName={bookingJourney.legs[0]?.from ?? 'Station'}
          stationLat={bookingJourney.legs[0]?.fromLat}
          stationLng={bookingJourney.legs[0]?.fromLng}
          onCancel={handleBookingCancel}
          onRetry={handleBookingRetry}
        />
      ) : (
        <JourneySheet
          journeys={journeys}
          isPolling={isPolling}
          destination={destination}
          originName={originName}
          onJourneyPress={handleJourneyPress}
        />
      )}
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
