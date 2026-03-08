export interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  priceFrom: number | null;
}
