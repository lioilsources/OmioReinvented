import { generateJourneys } from '@/mocks/data/journeys';
import { TRAVEL_MODES } from './config';
import { modeConfigs } from '@/features/map/utils/modeConfig';
import type { Destination, DistanceMode, Journey, TimeMode, TransportType } from '@/shared/types';

function getDateForTimeMode(mode: TimeMode): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (mode) {
    case 'tomorrow': {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return fmt(d);
    }
    case 'next_week': {
      const d = new Date(now);
      const daysUntilMonday = ((8 - d.getDay()) % 7) || 7;
      d.setDate(d.getDate() + daysUntilMonday);
      return fmt(d);
    }
    case 'next_month': {
      const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return fmt(d);
    }
    case 'holidays': {
      const d = new Date(now);
      d.setDate(d.getDate() + 14);
      return fmt(d);
    }
    case 'christmas': {
      const year = now.getMonth() >= 11 ? now.getFullYear() : now.getFullYear();
      return `${year}-12-23`;
    }
    case 'spring_break': {
      const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
      return `${year}-03-15`;
    }
  }
}

export function searchJourneys(
  destination: Destination,
  timeMode: TimeMode,
  distanceMode: DistanceMode,
): Promise<Journey[]> {
  const date = getDateForTimeMode(timeMode);
  const transportTypes = modeConfigs[distanceMode].transports;
  const basePrice = destination.priceFrom ?? 10;

  const journeys = generateJourneys(
    destination.id,
    destination.name,
    transportTypes,
    basePrice,
    date,
  );

  return Promise.resolve(journeys);
}

export function browseJourneys(
  destinations: Destination[],
  distanceMode: DistanceMode,
): Promise<Journey[]> {
  const date = getDateForTimeMode('tomorrow');
  const transportTypes = modeConfigs[distanceMode].transports;

  const perDest = destinations.map((dest) => {
    const basePrice = dest.priceFrom ?? 10;
    const journeys = generateJourneys(
      dest.id,
      dest.name,
      transportTypes,
      basePrice,
      date,
    );
    return journeys.map((j) => ({
      ...j,
      destinationName: dest.name,
      destinationId: dest.id,
    }));
  });

  // Round-robin interleave
  const result: Journey[] = [];
  const maxLen = Math.max(...perDest.map((arr) => arr.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const arr of perDest) {
      if (i < arr.length) result.push(arr[i]);
    }
  }

  return Promise.resolve(result);
}
