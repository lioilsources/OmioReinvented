# Post-Booking Navigation Map

## Context

After a successful booking, show an embedded Google Maps widget in the bottom sheet success screen. The map displays a route from the user's current location to the departure station, helping the user navigate to their train/bus.

---

## Reused Infrastructure

- `react-native-maps` v1.20.1 with `PROVIDER_GOOGLE` — already installed
- Google Maps API key `AIzaSyBL4LW69ATiIb3HrzpLI1_0JaL9oy5CQow` in `app.json` (iOS + Android)
- `useUserLocation` hook at `src/features/map/hooks/useUserLocation.ts` — returns device position (falls back to Křižíkova 237, Karlín in dev mode to avoid simulator GPS returning California)
- `mutedMapStyle` at `src/features/map/utils/mapStyle.ts` — consistent map styling
- `useSearchStore.origin` — departure city coordinates (used as station position since journey legs don't include lat/lng)
- `Journey.legs[0].from` — departure station name (string, e.g. "Praha hlavní nádraží")
- `BottomSheetScrollView` from `@gorhom/bottom-sheet` — scrollable content inside bottom sheet

## Station Coordinates Limitation

`Journey.legs[0].from` is a string (station name) without coordinates. We use `useSearchStore.origin` (city-level lat/lng) as the station marker position. This is approximate but sufficient for city-level navigation.

---

## Files Created

### `src/features/booking/components/NavigationMap.tsx`

Embedded MapView widget with route display:

- **Props**: `stationName: string` (marker title, from `journey.legs[0].from`)
- **Data sources**: `useUserLocation()` for user position, `useSearchStore.origin` for station coords
- **Google Directions API**: Fetches walking route between user → station, decodes `overview_polyline.points` into coordinate array. 8s timeout via `AbortController`.
- **Fallback**: If Directions API fails (not enabled, timeout), draws straight line between the two points
- **Map config**: `PROVIDER_GOOGLE`, `mutedMapStyle`, 440px height, `borderRadius.lg`, `paddingHorizontal: spacing.md`
- **fitToCoordinates**: On `onMapReady`, fits map to show both markers with 60px edge padding
- **Markers**: Blue pin (user location), green pin (station)
- **Polyline**: Directions route or straight-line fallback, `colors.routeLine`, width 3
- **Info row**: Shows "distance · duration" from Directions API, or "Navigate to {stationName}" as fallback

### Polyline Decoder

`decodePolyline(encoded: string)` — inline utility implementing Google's encoded polyline algorithm. Converts the `overview_polyline.points` string from Directions API into `{latitude, longitude}[]`.

---

## Files Modified

### `src/features/booking/components/BookingSheet.tsx`

- Added `stationName: string` to `BookingSheetProps`
- `phase === 'completed'` block: changed wrapper from `<View>` to `<BottomSheetScrollView>` (enables scrolling in bottom sheet for taller content)
- Inserted `<NavigationMap stationName={stationName} />` between success info and "Back to results" button
- Added `scrollContainer` style (no `flex: 1`, with `paddingBottom: spacing.xl`)

### `src/features/map/components/MapBottomSheet.tsx`

- Passes `stationName={bookingJourney.legs[0]?.from ?? 'Station'}` to `<BookingSheet>`

### `src/features/map/hooks/useUserLocation.ts`

- Fallback coordinates changed to Křižíkova 237, Karlín (50.0928, 14.4539)
- In `__DEV__` mode, skips GPS entirely and returns fallback immediately (iOS simulator GPS returns Cupertino, CA)

---

## Google Cloud Console Requirement

The Directions API must be enabled in Google Cloud Console for the existing API key. Without it:
- Map renders correctly with both markers
- Polyline falls back to straight line
- No distance/duration info (shows "Navigate to {stationName}" instead)

To enable: Google Cloud Console → APIs & Services → Library → search "Directions API" → Enable

---

## Search Results Progress Bar

Also added as part of this work:

### `src/features/map/components/JourneySheet.tsx`

- Added `SearchProgressBar` component — animated progress bar shown during journey search polling
- Bar grows with `journeyCount` (capped at 90% until polling completes), pulsing opacity animation
- Renders between header and filter bar when `isPolling === true`
- Default sort changed from `'timetable'` to `'cheapest'`

### `src/features/results/components/JourneyFilterBar.tsx`

- Tab order changed to: Cheapest → Fastest → Timetable

---

## Verification

1. Complete a booking → success screen shows map widget below checkmark
2. Map shows two markers: blue (user at Křižíkova) and green (station at origin coords)
3. Polyline drawn between them (straight line if Directions API not enabled)
4. If Directions API enabled: route follows streets, distance/duration shown below map
5. Map auto-zooms to fit both markers with padding
6. Content scrollable in bottom sheet (BottomSheetScrollView)
7. Click destination marker → progress bar animates during search polling
8. Filter bar shows Cheapest (active) → Fastest → Timetable
