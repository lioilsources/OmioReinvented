# Plan: Map Bubbles, Zoom Fix, Browse Results, Departure Time Slider

## Context
4 changes to make the app usable: (1) price bubbles show city name, (2) zoom levels adjusted so bubbles visible, (3) results tab always shows journeys, (4) vertical time-of-day slider on map that changes bubble prices.

---

## Feature 1: City name in price bubbles

**File:** `src/features/map/components/PriceBubbleMarker.tsx`

- Add `destination.name` as `<Text>` above the price inside the bubble view
- New styles: `name` (fontSize.xs, fontWeight '600', color text, textAlign center), `nameHighlighted` (color white)
- Add `alignItems: 'center'` to bubble style
- Result: bubble shows "Brno\n€9" instead of just "€9"
- The price displayed will be driven by a new prop (see Feature 4) — instead of hardcoded `destination.priceFrom`, use a `price` prop

---

## Feature 2: Fix zoom levels

**File:** `src/features/map/utils/modeConfig.ts`

| Mode | Old zoomDelta | New zoomDelta | latDelta change |
|------|--------------|--------------|-----------------|
| short | 12 | 9 | 0.09° → 0.7° |
| medium | 8 | 6 | 1.4° → 5.6° |
| long | 5 | 5 | unchanged |
| extra-long | 3 | 3 | unchanged |

---

## Feature 3: Results tab always shows journeys (browse mode)

When no destination is selected, show tomorrow's first departures from ALL destinations in current distance mode, interleaved round-robin.

### Types
**`src/shared/types/journey.ts`** — add optional `destinationName?: string` and `destinationId?: string` to `Journey`

### API
**`src/api/journeys.ts`** — add `browseJourneys(mode: DistanceMode): Promise<Journey[]>` calling `/api/journeys/browse?mode=X`

### Mock server
**`src/mocks/server.ts`** — new route `/api/journeys/browse`:
- Filter destinations by mode
- For each: `generateJourneys(...)` for tomorrow's date, tag with `destinationName`/`destinationId`
- Interleave round-robin: 1st departure per dest, then 2nd per dest, etc.

### Hook
**`src/features/results/hooks/useJourneys.ts`** — extend:
- If no destination → call `browseJourneys(distanceMode)`, always enabled
- If destination+timeMode → existing `searchJourneys` call

### JourneyCard
**`src/features/results/components/JourneyCard.tsx`** — when `journey.destinationName` exists, show "Prague → {name}" line at top of card

### Results screen
**`app/(tabs)/results.tsx`** — conditional header:
- Browse mode (no destination): "Browse Journeys" / "Tomorrow"
- Focused mode: existing "Prague → {destination.name}" header

---

## Feature 4: Departure time slider on map (changes bubble prices)

A vertical slider on the right edge of the map with 3 positions: Morning / Afternoon / Evening. Sliding it changes the price displayed in every bubble on the map.

**Pricing model:** multiplier on `priceFrom`:
- Morning (Ráno): `0.8x` — cheapest
- Afternoon (Odpoledne): `1.3x` — most expensive
- Evening (Večer): `1.0x` — baseline

### Type
**`src/shared/types/search.ts`** — add `DepartureTime = 'morning' | 'afternoon' | 'evening'`

**`src/shared/types/index.ts`** — export it

### Store
**`src/stores/useSearchStore.ts`** — add `departureTime: DepartureTime` (default: `'morning'`) and `setDepartureTime` action

### Price multiplier util
**New file: `src/features/map/utils/daytimePrice.ts`**
```
const multipliers = { morning: 0.8, afternoon: 1.3, evening: 1.0 }
getDaytimePrice(basePrice, departureTime) → Math.round(basePrice * multiplier)
```

### Vertical slider component
**New file: `src/features/map/components/DaytimeSlider.tsx`**
- Positioned absolute on the right side of the map (right: 16, vertically centered)
- 3 vertical options with sun icons:
  - Morning (top): sunrise icon (sun with upward rays / horizon) + "Ráno"
  - Afternoon (middle): full sun icon (bright sun) + "Odpoledne"
  - Evening (bottom): sunset icon (sun setting / horizon) + "Večer"
- Icons as emoji (consistent with TransportIcon pattern): 🌅 sunrise, ☀️ sun, 🌇 sunset
- Active option highlighted with primary color pill
- zIndex: 10 (same as ModeSelector)
- On press → calls `setDepartureTime(value)`
- Styled similarly to the existing mode chips but laid out vertically

### MapScreen integration
**`app/(tabs)/map.tsx`**:
- Read `departureTime` from search store
- Import `getDaytimePrice`
- Render `<DaytimeSlider>` alongside ModeSelector and OriginPill
- Pass computed prices to markers (or pass departureTime to PriceBubbleMarker)

### PriceBubbleMarker update
**`src/features/map/components/PriceBubbleMarker.tsx`**:
- Add `price: number` prop (computed by parent using getDaytimePrice)
- Display `€{price}` instead of `€{destination.priceFrom}`
- Note: `tracksViewChanges` must be set to `true` or markers won't re-render when price changes. To avoid constant tracking, we can conditionally set it, or better: use a `key` prop on `<Marker>` that includes the price so React recreates the marker on price change.

### DestinationMarkers update
**`src/features/map/components/DestinationMarkers.tsx`** — pass `departureTime` to each marker, or compute price and pass it down

### MapViewContainer update
**`src/features/map/components/MapViewContainer.tsx`** — accept `departureTime` prop and pass through to DestinationMarkers

---

## Implementation Order
1. Feature 2 (zoom fix) — 1 file, instant
2. Feature 1 (city name bubbles) — 1 file
3. Feature 4 (daytime slider) — 7 files (types, store, util, component, marker chain)
4. Feature 3 (browse mode) — 6 files (API, mock, hook, card, results screen)

## Verification
- `npm start` → open on iOS/web
- Map: bubbles show "City\n€Price", all visible per zoom level
- Slide departure time → bubble prices change (morning cheapest, afternoon most expensive)
- Results tab with no selection: shows interleaved journeys for all destinations
- Full flow (select dest → time → pax → results) still works
