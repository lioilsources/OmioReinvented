import type { TransportType } from './search';

export interface JourneyLeg {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  transportType: TransportType;
  provider: string;
}

export interface Journey {
  id: string;
  provider: string;
  departure: string;
  arrival: string;
  duration: number;
  price: number;
  legs: JourneyLeg[];
  transportType: TransportType;
}
