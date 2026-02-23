export type DistanceMode = 'short' | 'medium' | 'long' | 'extra-long';

export type TimeMode =
  | 'tomorrow'
  | 'next_week'
  | 'next_month'
  | 'holidays'
  | 'christmas'
  | 'spring_break';

export type TransportType =
  | 'tram'
  | 'bus'
  | 'train'
  | 'flixbus'
  | 'flight'
  | 'scooter';

export type DepartureTime = 'morning' | 'afternoon' | 'evening';

export interface Child {
  age: number;
}

export interface PaxConfig {
  adults: number;
  children: Child[];
}
