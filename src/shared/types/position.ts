export interface Position {
  id: string;
  name: string;
  translatedName?: string;
  type: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  population?: number;
  poiTypes?: string[];
}

export interface MapBounds {
  northLat: number;
  southLat: number;
  westLon: number;
  eastLon: number;
}
