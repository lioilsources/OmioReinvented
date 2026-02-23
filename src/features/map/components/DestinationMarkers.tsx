import React from 'react';
import { PriceBubbleMarker } from './PriceBubbleMarker';
import { getDaytimePrice } from '../utils/daytimePrice';
import type { DepartureTime, Destination } from '@/shared/types';

interface DestinationMarkersProps {
  destinations: Destination[];
  highlightedId: string | null;
  departureTime: DepartureTime;
  onMarkerPress: (destination: Destination) => void;
}

export function DestinationMarkers({
  destinations,
  highlightedId,
  departureTime,
  onMarkerPress,
}: DestinationMarkersProps) {
  return (
    <>
      {destinations.map((dest) => (
        <PriceBubbleMarker
          key={`${dest.id}-${departureTime}`}
          destination={dest}
          price={getDaytimePrice(dest.priceFrom, departureTime)}
          highlighted={dest.id === highlightedId}
          onPress={() => onMarkerPress(dest)}
        />
      ))}
    </>
  );
}
