import type { DistanceMode, TimeMode, TransportType } from './search';

export interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  priceFrom: number;
  popularity: number;
  modes: DistanceMode[];
  imageUrl: string;
  transportTypes: TransportType[];
  prices_by_when: Record<TimeMode, number>;
}
