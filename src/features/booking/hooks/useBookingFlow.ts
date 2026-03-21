import { useState, useCallback, useRef } from 'react';
import {
  getOffers,
  createBooking,
  getBooking,
  updateBooking,
  confirmBooking,
} from '@/api/booking';
import type { Journey } from '@/shared/types';
import type { BookingResponse, BookingStatus, TravellerFieldDef } from '@/shared/types/booking';

export type BookingPhase =
  | 'idle'
  | 'fetching_offers'
  | 'creating_booking'
  | 'polling_initialised'
  | 'updating_travellers'
  | 'polling_reserved'
  | 'confirming'
  | 'polling_booked'
  | 'completed'
  | 'error';

interface BookingFlowState {
  phase: BookingPhase;
  bookingId: string | null;
  bookingStatus: BookingStatus | null;
  error: string | null;
}

const POLL_INTERVAL = 2000;
const MAX_POLLS = 30;
const ERROR_STATUSES: BookingStatus[] = ['PRICE_CHANGE', 'SOLD_OUT', 'FAILED', 'TIMEOUT'];

const HARDCODED_VALUES: Record<string, string> = {
  email: 'oldrich.vorechovsky@omio.com',
  firstName: 'Olin',
  lastName: 'Vorechovsky',
  title: 'Mr',
  birthDate: '2000-09-09',
  countryOfResidence: 'CZ',
  birthCountry: 'CZ',
  phoneNumber: '+420774007007',
  documentType: 'PASSPORT',
  documentNumber: 'P9876543',
  documentExpirationDate: '2030-09-09',
  documentIssueDate: '2020-01-01',
  documentIssueCountry: 'CZ',
  documentIssueCity: 'Prague',
  addressCountry: 'CZ',
  addressCity: 'Prague',
  addressLine1: 'Vaclavske namesti 1',
  addressZipCode: '11000',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollUntilStatus(
  bookingId: string,
  targetStatus: BookingStatus,
  cancelRef: React.MutableRefObject<boolean>,
): Promise<BookingResponse> {
  for (let i = 0; i < MAX_POLLS; i++) {
    if (cancelRef.current) throw new Error('Cancelled');
    await delay(POLL_INTERVAL);
    const resp = await getBooking(bookingId);
    if (__DEV__) console.log(`[BOOKING] Poll ${i + 1}: status=${resp.status}, target=${targetStatus}`);
    if (ERROR_STATUSES.includes(resp.status)) {
      throw new Error(`Booking ${resp.status}`);
    }
    if (resp.status === targetStatus) return resp;
  }
  throw new Error(`Timeout waiting for ${targetStatus}`);
}

function buildTravellerFields(
  requiredFieldIds: string[],
  fieldDefs: Record<string, TravellerFieldDef>,
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const fieldId of requiredFieldIds) {
    const def = fieldDefs[fieldId];
    if (!def) {
      if (__DEV__) console.warn(`[BOOKING] Unknown field ${fieldId}, skipping`);
      continue;
    }
    const value = HARDCODED_VALUES[def.type];
    if (value) {
      fields[fieldId] = value;
      if (__DEV__) console.log(`[BOOKING] Field ${fieldId}: type=${def.type} → ${value}`);
    } else {
      if (__DEV__) console.warn(`[BOOKING] No hardcoded value for field type: ${def.type} (id=${fieldId}, label=${def.label})`);
    }
  }
  return fields;
}

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>({
    phase: 'idle',
    bookingId: null,
    bookingStatus: null,
    error: null,
  });

  const cancelRef = useRef(false);

  const startBooking = useCallback(async (journey: Journey) => {
    cancelRef.current = false;

    try {
      // Phase 1: Fetch offers
      setState({ phase: 'fetching_offers', bookingId: null, bookingStatus: null, error: null });
      if (__DEV__) console.log(`[BOOKING] Fetching offers: searchId=${journey.searchId}, journeyId=${journey.id}, outboundId=${journey.outboundId}`);
      const offersResp = await getOffers(journey.searchId, journey.id, journey.outboundId);
      if (cancelRef.current) return;
      if (__DEV__) console.log(`[BOOKING] Offers response keys:`, JSON.stringify(Object.keys(offersResp)));
      if (__DEV__) console.log(`[BOOKING] Offers journey keys:`, JSON.stringify(Object.keys(offersResp.journey ?? {})));

      const offers = offersResp.journey?.offersCombined ?? offersResp.journey?.offers ?? [];
      if (offers.length === 0) throw new Error('No offers available');
      // Pick the cheapest offer
      const cheapest = offers.reduce((best, o) => (o.priceCents < best.priceCents ? o : best), offers[0]);
      if (__DEV__) console.log(`[BOOKING] Got ${offers.length} offers, cheapest: ${cheapest.id} (${cheapest.priceCents}c)`);

      // Use IDs from the offers response (not from the Journey object)
      const bookingSearchId = offersResp.searchId;
      const bookingJourneyId = offersResp.journey.id;
      if (__DEV__) console.log(`[BOOKING] Using searchId=${bookingSearchId}, journeyId=${bookingJourneyId}`);

      // Phase 2: Create booking
      setState((s) => ({ ...s, phase: 'creating_booking' }));
      const createResp = await createBooking(bookingSearchId, bookingJourneyId, [cheapest.id]);
      if (cancelRef.current) return;
      const bookingId = createResp.id;
      if (__DEV__) console.log(`[BOOKING] Created booking: ${bookingId}, status=${createResp.status}`);
      setState((s) => ({ ...s, bookingId, bookingStatus: createResp.status }));

      // Phase 3: Poll until INITIALISED
      setState((s) => ({ ...s, phase: 'polling_initialised' }));
      let initResp = createResp;
      if (createResp.status !== 'INITIALISED') {
        initResp = await pollUntilStatus(bookingId, 'INITIALISED', cancelRef);
        if (cancelRef.current) return;
      }
      if (__DEV__) console.log(`[BOOKING] Initialised. Travellers: ${initResp.travellers?.length}, fields: ${Object.keys(initResp.travellerFields ?? {}).length}`);

      // Phase 4: Update travellers
      setState((s) => ({ ...s, phase: 'updating_travellers', bookingStatus: 'INITIALISED' }));
      const traveller = initResp.travellers?.[0];
      if (!traveller) throw new Error('No traveller in booking response');
      const fieldDefs = initResp.travellerFields ?? {};
      const fieldMap = buildTravellerFields(traveller.requiredFields, fieldDefs);
      if (__DEV__) console.log(`[BOOKING] Updating traveller ${traveller.id} with ${Object.keys(fieldMap).length} fields`);
      await updateBooking(bookingId, [{ id: traveller.id, fields: fieldMap }]);
      if (cancelRef.current) return;

      // Phase 5: Poll until RESERVED
      setState((s) => ({ ...s, phase: 'polling_reserved', bookingStatus: 'RESERVING' }));
      await pollUntilStatus(bookingId, 'RESERVED', cancelRef);
      if (cancelRef.current) return;
      if (__DEV__) console.log(`[BOOKING] Reserved`);

      // Phase 6: Confirm
      setState((s) => ({ ...s, phase: 'confirming', bookingStatus: 'RESERVED' }));
      await confirmBooking(bookingId);
      if (cancelRef.current) return;

      // Phase 7: Poll until BOOKED
      setState((s) => ({ ...s, phase: 'polling_booked', bookingStatus: 'BOOKING' }));
      await pollUntilStatus(bookingId, 'BOOKED', cancelRef);
      if (cancelRef.current) return;

      if (__DEV__) console.log(`[BOOKING] BOOKED!`);
      setState((s) => ({ ...s, phase: 'completed', bookingStatus: 'BOOKED' }));
    } catch (err) {
      if (!cancelRef.current) {
        const msg = (err as Error).message;
        if (__DEV__) console.error(`[BOOKING] Error: ${msg}`);
        setState((s) => ({ ...s, phase: 'error', error: msg }));
      }
    }
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setState({ phase: 'idle', bookingId: null, bookingStatus: null, error: null });
  }, []);

  return { ...state, startBooking, cancel };
}
