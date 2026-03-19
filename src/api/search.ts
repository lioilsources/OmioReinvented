import { apiPost, apiGet } from './client';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from './config';

// --- API types (camelCase, matching b2b-platform OpenAPI spec) ---

export interface SearchCarrier {
  id: string;
  name: string;
  logoUrl: string;
}

export interface SearchOutbound {
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  carrierId: string;
  travelMode: string;
  segmentIds?: number[];
  price?: number;
}

export interface SearchJourney {
  id: string;
  cheapestPriceCents: number;
  outbound: SearchOutbound;
}

export interface SearchSegment {
  id: string;
  departureTime: string;
  arrivalTime: string;
  departurePositionId?: string;
  arrivalPositionId?: string;
  carrierId: string;
  durationMinutes: number;
}

export interface SearchPosition {
  id: string;
  name: string;
  cityName?: string;
}

export interface SearchResponse {
  searchId: string;
  status: 'running' | 'done' | 'queued';
  currency: string;
  journeys?: SearchJourney[];
  carriers?: SearchCarrier[];
  segments?: SearchSegment[];
  positions?: SearchPosition[];
}

// --- API functions ---

export async function triggerSearch(
  fromId: string,
  toId: string,
  outboundDateTime: string,
  travelModes: string[],
): Promise<SearchResponse> {
  const body = {
    from: { id: fromId },
    to: { id: toId },
    outboundDateTime,
    currency: DEFAULT_CURRENCY,
    locale: DEFAULT_LOCALE,
    travelModes,
    travellers: [{ age: 30 }],
    timeoutSeconds: 10,
  };

  return apiPost<SearchResponse>('/search/without-offers', body);
}

export async function pollSearchResults(
  searchId: string,
): Promise<SearchResponse> {
  return apiGet<SearchResponse>(`/search/without-offers/${searchId}`);
}
