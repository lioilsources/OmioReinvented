import { apiGet, apiPost } from './client';
import type { OffersResponse, BookingResponse } from '@/shared/types/booking';

export async function getOffers(
  searchId: string,
  journeyId: string,
  outboundId: string,
): Promise<OffersResponse> {
  return apiGet<OffersResponse>(`/search/${searchId}/offers`, {
    journeyId,
    outboundId,
  });
}

export async function createBooking(
  searchId: string,
  journeyId: string,
  offerIds: string[],
): Promise<BookingResponse> {
  return apiPost<BookingResponse>('/bookings', {
    searchId,
    journeyId,
    offerIds,
  });
}

export async function getBooking(bookingId: string): Promise<BookingResponse> {
  return apiGet<BookingResponse>(`/bookings/${bookingId}`);
}

export async function updateBooking(
  bookingId: string,
  travellerUpdates: Array<{ id: string; fields: Record<string, string> }>,
): Promise<BookingResponse> {
  return apiPost<BookingResponse>(`/bookings/${bookingId}`, {
    travellerUpdateRequest: travellerUpdates,
  });
}

export async function confirmBooking(
  bookingId: string,
  paymentCountry: string = 'CZ',
): Promise<BookingResponse> {
  return apiPost<BookingResponse>(`/bookings/${bookingId}/confirm`, {
    paymentCountry,
  });
}
