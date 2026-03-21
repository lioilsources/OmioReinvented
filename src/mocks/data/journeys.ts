import type { Journey, JourneyLeg, TransportType } from '@/shared/types';

const providers: Record<TransportType, string[]> = {
  train: ['České dráhy', 'RegioJet', 'Leo Express', 'ÖBB', 'DB'],
  flixbus: ['FlixBus'],
  bus: ['FlixBus', 'RegioJet Bus', 'ČSAD'],
  flight: ['Ryanair', 'Wizz Air', 'easyJet', 'Czech Airlines'],
  tram: ['DPP'],
  scooter: ['Lime', 'Bolt'],
};

// Simple seeded pseudo-random number generator
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateJourneys(
  destinationId: string,
  destinationName: string,
  transportTypes: TransportType[],
  basePrice: number,
  date: string
): Journey[] {
  const seed = hashString(`${destinationId}-${date}`);
  const rand = seededRandom(seed);
  const count = 5 + Math.floor(rand() * 6); // 5-10 journeys
  const journeys: Journey[] = [];

  for (let i = 0; i < count; i++) {
    const transport = transportTypes[Math.floor(rand() * transportTypes.length)];
    const providerList = providers[transport];
    const provider = providerList[Math.floor(rand() * providerList.length)];

    const departureHour = 5 + Math.floor(rand() * 16); // 5:00 - 20:00
    const departureMin = Math.floor(rand() * 4) * 15; // 0, 15, 30, 45

    let durationMin: number;
    switch (transport) {
      case 'flight':
        durationMin = 60 + Math.floor(rand() * 120);
        break;
      case 'train':
        durationMin = 90 + Math.floor(rand() * 240);
        break;
      case 'flixbus':
      case 'bus':
        durationMin = 120 + Math.floor(rand() * 300);
        break;
      default:
        durationMin = 15 + Math.floor(rand() * 45);
    }

    const arrivalTotalMin = departureHour * 60 + departureMin + durationMin;
    const arrivalHour = Math.floor(arrivalTotalMin / 60) % 24;
    const arrivalMinute = arrivalTotalMin % 60;

    const priceVariation = 0.7 + rand() * 0.8; // 70% - 150% of base
    const price = Math.round(basePrice * priceVariation * 100) / 100;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const departure = `${date}T${pad(departureHour)}:${pad(departureMin)}:00`;
    const arrival = `${date}T${pad(arrivalHour)}:${pad(arrivalMinute)}:00`;

    const hasTransfer = rand() > 0.6;
    const legs: JourneyLeg[] = hasTransfer
      ? [
          {
            from: 'Prague',
            to: 'Transfer',
            departure,
            arrival: `${date}T${pad(departureHour + 1)}:${pad(departureMin)}:00`,
            transportType: transport,
            provider,
          },
          {
            from: 'Transfer',
            to: destinationName,
            departure: `${date}T${pad(departureHour + 1)}:${pad((departureMin + 15) % 60)}:00`,
            arrival,
            transportType: transport,
            provider,
          },
        ]
      : [
          {
            from: 'Prague',
            to: destinationName,
            departure,
            arrival,
            transportType: transport,
            provider,
          },
        ];

    journeys.push({
      id: `${destinationId}-${date}-${i}`,
      searchId: '',
      outboundId: '',
      provider,
      departure,
      arrival,
      duration: durationMin,
      price,
      legs,
      transportType: transport,
    });
  }

  return journeys.sort((a, b) => a.departure.localeCompare(b.departure));
}
