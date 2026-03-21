export type BookingStatus =
  | 'INITIALISING'
  | 'INITIALISED'
  | 'RESERVING'
  | 'RESERVED'
  | 'BOOKING'
  | 'BOOKED'
  | 'PRICE_CHANGE'
  | 'SOLD_OUT'
  | 'FAILED'
  | 'TIMEOUT';

export interface Offer {
  id: string;
  priceCents: number;
}

export interface OffersResponse {
  searchId: string;
  journey: {
    id: string;
    offers: Offer[];
    offersCombined?: Offer[];
  };
  status: string;
}

export interface BookingTraveller {
  id: string;
  age: number;
  requiredFields: string[];
  optionalFields?: string[];
  suppliedFields?: Record<string, string>;
}

export interface TravellerFieldDef {
  type: string;
  inputType: string;
  label: string;
  validations?: Array<{ message: string; regex: string }>;
  options?: Array<{ key: string; label: string }>;
}

export interface BookingPrice {
  totalPriceCents: number;
  priceBreakdown?: Array<{
    type: string;
    unitPriceCents: number;
    quantity: number;
  }>;
}

export interface BookingResponse {
  id: string;
  status: BookingStatus;
  searchId?: string;
  travellers?: BookingTraveller[];
  travellerFields?: Record<string, TravellerFieldDef>;
  price?: BookingPrice;
  reservationValidUntil?: string;
}
