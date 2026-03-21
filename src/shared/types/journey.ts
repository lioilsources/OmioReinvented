import type { TransportType } from './search';

export interface JourneyLeg {
  from: string;
  fromLat?: number;
  fromLng?: number;
  to: string;
  toLat?: number;
  toLng?: number;
  departure: string;
  arrival: string;
  transportType: TransportType;
  provider: string;
}

export interface Journey {
  id: string;
  searchId: string;
  outboundId: string;
  provider: string;
  departure: string;
  arrival: string;
  duration: number;
  price: number;
  legs: JourneyLeg[];
  transportType: TransportType;
  destinationName?: string;
  destinationId?: string;
}
