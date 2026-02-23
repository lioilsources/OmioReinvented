import React from 'react';
import { PriceBubbleMarker } from './PriceBubbleMarker';
import type { Destination } from '@/shared/types';

interface DestinationMarkersProps {
  destinations: Destination[];
  highlightedId: string | null;
  onMarkerPress: (destination: Destination) => void;
}

export function DestinationMarkers({
  destinations,
  highlightedId,
  onMarkerPress,
}: DestinationMarkersProps) {
  return (
    <>
      {destinations.map((dest) => (
        <PriceBubbleMarker
          key={dest.id}
          destination={dest}
          highlighted={dest.id === highlightedId}
          onPress={() => onMarkerPress(dest)}
        />
      ))}
    </>
  );
}
