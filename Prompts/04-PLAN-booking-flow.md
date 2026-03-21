# Booking Flow Implementation Plan

## Context

When tapping a journey card in the results list, execute a full booking flow: **fetch offers → create booking → poll INITIALISED → update traveller info → poll RESERVED → confirm → poll BOOKED**. Single adult passenger only with hardcoded traveller data. The booking progress is shown in the bottom sheet (replaces journey list).

## Critical Data Gap

The offers endpoint requires `searchId`, `journeyId`, and `outboundId`. Currently:
- `Journey` type lacks `searchId` and `outboundId`
- `SearchOutbound` type lacks `id` field
- These must be propagated from the search response through the mapper

**Risk**: The `/search/without-offers` response may not include `outbound.id`. If missing, we'll need to log the raw response to discover the field name or switch to a different search endpoint.

---

## Files to Create

### 1. `src/shared/types/booking.ts` — Booking API types

```typescript
BookingStatus = 'INITIALISING' | 'INITIALISED' | 'RESERVING' | 'RESERVED'
              | 'BOOKING' | 'BOOKED' | 'PRICE_CHANGE' | 'SOLD_OUT' | 'FAILED' | 'TIMEOUT'

Offer { id, priceCents, ... }
OffersResponse { searchId, journey: { offers: Offer[] }, status, ... }
BookingTraveller { id, requiredFields: string[], optionalFields: string[] }
TravellerFieldDef { type, inputType, label, validations? }
BookingResponse { id, status, travellers?, travellerFields?, price? }
```

### 2. `src/api/booking.ts` — 5 API functions

| Function | Method | Path |
|----------|--------|------|
| `getOffers(searchId, journeyId, outboundId)` | GET | `/search/{searchId}/offers?journeyId=X&outboundId=Y` |
| `createBooking(searchId, journeyId, offerIds)` | POST | `/bookings` |
| `getBooking(bookingId)` | GET | `/bookings/{bookingId}` |
| `updateBooking(bookingId, travellerUpdates)` | POST | `/bookings/{bookingId}` |
| `confirmBooking(bookingId, paymentCountry)` | POST | `/bookings/{bookingId}/confirm` |

All use existing `apiGet`/`apiPost` from `client.ts`.

### 3. `src/features/booking/hooks/useBookingFlow.ts` — Imperative state machine

**Phases**: idle → fetching_offers → creating_booking → polling_initialised → updating_travellers → polling_reserved → confirming → polling_booked → completed | error

**Imperative async approach** (not React Query `refetchInterval`) because the flow is a sequential multi-step pipeline — each step depends on the previous result, with polling interspersed between mutations.

**Polling helper**: `pollUntilStatus(bookingId, targetStatus, cancelRef)` — polls `GET /bookings/{id}` every 2s, max 30 attempts. Throws on error statuses (PRICE_CHANGE, SOLD_OUT, FAILED, TIMEOUT).

**Traveller field mapping**: For each `traveller.requiredFields[i]`, look up `travellerFields[fieldId].type` and return hardcoded value:
- email → "oldrich.vorechovsky@omio.com"
- firstName → "Olin", lastName → "Vorechovsky", title → "Mr"
- birthDate → "2000-09-09", countryOfResidence → "CZ"
- phoneNumber → "+420774007007"
- documentType → "PASSPORT", documentNumber → "P9876543"
- documentExpirationDate → "2030-09-09", documentIssueCountry → "CZ"

**Returns**: `{ phase, bookingId, error, startBooking(journey), cancel() }`

### 4. `src/features/booking/components/BookingSheet.tsx` — Progress UI

Vertical stepper showing all phases. Current phase has spinner, completed phases have checkmark, future phases grayed out. Cancel button during active phases. Success view on completion with "Back to map" button.

---

## Files to Modify

### 5. `src/shared/types/journey.ts`
Add `searchId: string` and `outboundId: string` to `Journey` interface.

### 6. `src/api/search.ts`
Add `id?: string` to `SearchOutbound` interface.

### 7. `src/api/searchMapper.ts`
In `mapSearchResponse`, propagate `response.searchId` → `journey.searchId` and `ob.id` → `journey.outboundId` (lines 74-83).

### 8. `src/shared/types/index.ts`
Re-export booking types.

### 9. `src/features/results/components/JourneyCard.tsx`
- Add `onPress?: () => void` prop
- Wrap outer `<View>` in `<Pressable onPress={onPress}>` (from react-native)

### 10. `src/features/map/components/JourneySheet.tsx`
- Add `onJourneyPress?: (journey: Journey) => void` prop
- Pass `() => onJourneyPress?.(item)` to each JourneyCard's `onPress`

### 11. `src/features/map/components/MapBottomSheet.tsx`
- Track `bookingJourney: Journey | null` in local state
- When set, render `<BookingSheet>` instead of `<JourneySheet>`
- `useBookingFlow` hook lives here — pass state + cancel to BookingSheet
- On cancel/complete: set `bookingJourney` to null → returns to JourneySheet

### 12. `src/stores/useUIStore.ts`
No changes needed — the sheet swap is handled locally in MapBottomSheet via `bookingJourney` state, not via the global `activeSheet`.

---

## Implementation Order

1. Types + mapper changes (5, 6, 7, 8) — propagate searchId/outboundId
2. Booking API layer (1, 2) — types + API functions
3. Booking flow hook (3) — state machine
4. Booking UI (4) — progress sheet
5. JourneyCard tap (9, 10) — make cards tappable
6. Wire up (11) — MapBottomSheet conditional rendering

---

## Verification

1. Tap a journey card → bottom sheet switches to BookingSheet with progress stepper
2. Console logs show each API call in sequence (offers → create → poll → update → poll → confirm → poll)
3. Traveller fields mapped correctly from `travellerFields` response (log `fieldId → type → value`)
4. Final status is BOOKED with success UI
5. Cancel button returns to journey list
6. Error states (SOLD_OUT, etc.) show error UI with retry option
