# OmioReinvented — Phase 1 Implementation Plan

## Context

Reinventing the Omio mobile app from a form-first approach to a map-first exploration experience. Instead of filling all search parameters upfront, the user progressively narrows their journey through 3 steps: **KAM** (where) → **KDY** (when) → **KOLIK** (how many) → results.

The project starts from an empty directory. Phase 1 uses mock data only — real APIs (Omio BigQuery, discovery-api) come later.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo (Expo Router) |
| Map | `react-native-maps` (Google Maps on Android, Apple Maps on iOS) |
| State | Zustand |
| Data fetching | TanStack Query |
| Animations | Reanimated 3 |
| Bottom sheet | `@gorhom/bottom-sheet` |
| Location | `expo-location` |
| Mock API | MSW (`msw/native`) |
| Language | TypeScript |

**Note:** Using `react-native-maps` instead of Mapbox — simpler setup, works with Expo Go (no custom dev client needed), free. Price bubble markers via custom `<Marker>` views (React Native views rendered as markers — fine for ~30 markers).

---

## User Flow

```
1. KAM (Where) — MapScreen
   - Auto-detect location (default Prague, overridable)
   - Mode selector: short / medium / long / extra-long
   - Map shows destination markers with price-per-1-pax bubbles
   - Bottom sheet: destination suggestion cards
   - User taps a destination → advance

2. KDY (When) — TimeSheet (bottom sheet over map)
   - Modes: tomorrow / next week / next month / holidays / Christmas / spring break
   - Prices update per-ticket (1 pax) based on selected time
   - User picks when → advance

3. KOLIK (How many) — PaxSheet (bottom sheet)
   - Adults counter (1-9)
   - Children with age picker (under 6 free, 6-14 half, 15+ full)
   - Total group price shown
   - "Search" CTA → advance

4. Results — JourneyResultsScreen
   - Journey list from mock B2B API
   - Sort: cheapest / fastest
   - Journey cards: times, duration, provider, legs, price
```

All 3 steps (KAM/KDY/KOLIK) live on the same MapScreen as bottom sheet swaps — map stays visible throughout. Uber/Google Maps style.

---

## Mode = Zoom Level

| Mode | Zoom delta | Radius | Transport |
|------|------------|--------|-----------|
| short | ~12 | 20km | trams, buses, scooters |
| medium | ~8 | 300km | trains, FlixBus |
| long | ~5 | country | trains, flights |
| extra-long | ~3 | continental | flights |

## When Modes → Date Ranges

| Mode | Maps to |
|------|---------|
| tomorrow | tomorrow |
| next_week | next Monday → Friday |
| next_month | 1st → last day of next month |
| holidays | nearest Czech public holidays |
| christmas | Dec 20 → Jan 2 |
| spring_break | nearest spring break dates |

---

## Directory Structure

```
OmioReinvented/
├── app/                          # Expo Router routes
│   ├── _layout.tsx               # Root: providers + MSW gate
│   ├── index.tsx                 # Redirect → /(tabs)/map
│   └── (tabs)/
│       ├── _layout.tsx           # Tab navigator
│       ├── map.tsx               # MapScreen (KAM + KDY + KOLIK sheets)
│       └── results.tsx           # JourneyResultsScreen
│
├── src/
│   ├── features/
│   │   ├── map/
│   │   │   ├── components/       # MapView, ModeSelector, PriceBubbleMarker,
│   │   │   │                       DestinationMarkers, MapBottomSheet,
│   │   │   │                       DestinationCard, DestinationList
│   │   │   ├── hooks/            # useUserLocation, useDestinations, useMapCamera
│   │   │   └── utils/            # geo.ts, modeConfig.ts
│   │   ├── time/
│   │   │   ├── components/       # TimeSheet, TimeModeChip, TimeModeGrid
│   │   │   ├── hooks/            # useTimeSelection
│   │   │   └── utils/            # dateRanges.ts
│   │   ├── passengers/
│   │   │   ├── components/       # PaxSheet, PaxCounter, ChildRow, PaxSummary, SearchButton
│   │   │   └── hooks/            # usePaxCalculation
│   │   └── results/
│   │       ├── components/       # JourneyCard, JourneyList, JourneyFilterBar, JourneyLeg
│   │       └── hooks/            # useJourneys, useJourneySort
│   │
│   ├── stores/
│   │   ├── useSearchStore.ts     # origin, destination, distanceMode, timeMode, pax, prices
│   │   └── useUIStore.ts         # activeSheet, mapInteracting
│   │
│   ├── api/
│   │   ├── client.ts             # fetch wrapper (MSW intercepts these)
│   │   ├── destinations.ts       # getDestinations(lat, lng, mode)
│   │   └── journeys.ts           # searchJourneys(params)
│   │
│   ├── mocks/
│   │   ├── server.ts             # setupServer from msw/native
│   │   ├── handlers/             # destinations.ts, journeys.ts
│   │   ├── data/                 # destinations.ts (~30 from Prague), journeys.ts (factory)
│   │   └── index.ts              # bootstrapMocks() — conditional on __DEV__
│   │
│   ├── shared/
│   │   ├── components/           # PriceBubble, Chip, TransportIcon, LoadingOverlay
│   │   ├── constants/            # theme.ts
│   │   └── types/                # destination.ts, journey.ts, search.ts, index.ts
│   │
│   └── providers/
│       └── QueryProvider.tsx
│
├── app.json                      # Expo config + location plugin
├── tsconfig.json                 # Path aliases: @/* → src/*
├── babel.config.js               # reanimated plugin + module-resolver
└── .env                          # GOOGLE_MAPS_API_KEY (Android only, optional)
```

---

## Build Order (9 Milestones)

### M0: Project Bootstrap
- `npx create-expo-app@latest OmioReinvented --template blank-typescript`
- Install deps: `react-native-maps`, `zustand`, `@tanstack/react-query`, `react-native-reanimated`, `react-native-gesture-handler`, `@gorhom/bottom-sheet`, `expo-location`, `msw`
- Configure `app.json` plugin for `expo-location` (permission strings)
- Configure `babel.config.js` (reanimated plugin)
- Verify app runs in **Expo Go** on both iOS Simulator + Android Emulator

### M1: Routing Shell
- `app/_layout.tsx`: GestureHandlerRootView + QueryProvider + BottomSheetModalProvider
- `app/(tabs)/_layout.tsx`: Tab navigator ("Explore" + "Results")
- `app/(tabs)/map.tsx` and `results.tsx`: placeholder screens
- `app/index.tsx`: redirect to `/(tabs)/map`

### M2: Types + Mock Data + MSW
- Define types in `src/shared/types/`:
  - `DistanceMode`: `'short' | 'medium' | 'long' | 'extra-long'`
  - `TimeMode`: `'tomorrow' | 'next_week' | 'next_month' | 'holidays' | 'christmas' | 'spring_break'`
  - `TransportType`: `'tram' | 'bus' | 'train' | 'flixbus' | 'flight' | 'scooter'`
  - `Destination`: `{ id, name, lat, lng, country, priceFrom, popularity, modes[], imageUrl, prices_by_when }`
  - `PaxConfig`: `{ adults, children: { age }[] }`
  - `Journey`: `{ id, provider, departure, arrival, duration, price, legs[], transportType }`
- Create ~30 mock destinations from Prague across all 4 modes with `prices_by_when`
- Create journey factory function (deterministic from destinationId seed)
- Set up MSW: `msw/native` + polyfills (`fast-text-encoding`, `react-native-url-polyfill`)
- Handlers: `GET /api/destinations` (filter by mode), `GET /api/journeys` (generate by dest+time)
- Gate app rendering on `bootstrapMocks()` in `_layout.tsx`

### M3: Zustand Stores
- `useSearchStore`: origin, distanceMode, destination, timeMode, pax + actions + derived price helpers (`getPricePerPax`, `getTotalPrice`)
- `useUIStore`: activeSheet, mapInteracting (separate to avoid re-renders during map panning)

### M4: MapScreen Core (KAM)
- `react-native-maps` `<MapView>` with `showsUserLocation`, ref for `animateToRegion`
- `ModeSelector`: 4 horizontal chips, switching mode calls `animateToRegion` with mode's zoom delta
- `PriceBubbleMarker`: custom `<Marker>` with child `<View>` showing "€19" styled bubble
- `DestinationMarkers`: maps destinations array → PriceBubbleMarker components
- Wire TanStack Query `useDestinations` hook → fetches by mode from MSW
- Marker `onPress` → set highlighted destination

### M5: Bottom Sheet + Destination Selection
- `@gorhom/bottom-sheet` with snap points [15%, 50%, 90%]
- `DestinationCard`: image placeholder, name, country, priceFrom, transport icons
- `DestinationList`: `BottomSheetFlatList` sorted by popularity
- Marker tap → scroll bottom sheet to card; card tap → `setDestination()` → swap to TimeSheet
- "From: Prague" pill overlay (tappable for future override)

### M6: TimeSheet (KDY)
- `TimeModeGrid`: 2×3 grid of chips
- Each chip: label ("Tomorrow", "Next week"...) + price from `destination.prices_by_when[mode]`
- Prices shown per 1 pax throughout this step
- Selection → `setTimeMode()` → swap to PaxSheet

### M7: PaxSheet (KOLIK)
- `PaxCounter`: adults stepper (1-9)
- `ChildRow`: age picker per child (0-17), removable
- "Add child" button
- `PaxSummary`: "2 adults + 1 child (6)" + total group price
- Price logic: under 6 free, 6-14 half, 15+ full
- `SearchButton`: "Search journeys" → `router.push('/(tabs)/results')`

### M8: Journey Results
- `useJourneys` TanStack Query hook → fetches from MSW using full search params from Zustand
- `JourneyCard`: departure/arrival times, duration, provider logo placeholder, price, leg visualization
- `JourneyFilterBar`: "Cheapest" / "Fastest" toggle
- `JourneyList`: FlatList
- Empty state component

---

## Key Technical Decisions

1. **react-native-maps with custom `<Marker>` views** — renders React Native views as map markers. ~30 markers = no performance issue. Price bubbles are just styled `<View>` + `<Text>`.
2. **MSW via `msw/native`** — patches global fetch, transparent to app code. When real APIs come, just remove MSW. No refactoring needed.
3. **Single MapScreen hosts all 3 sheets** (destinations, time, pax) — no screen transitions, just sheet swaps. Map stays visible throughout.
4. **Zustand `getPricePerPax()` and `getTotalPrice()`** derived in store — avoids scattered price logic.
5. **Prague as default fallback** when location permission denied.
6. **Expo Go compatible** — no custom dev client needed. All deps work within Expo Go.

---

## Gotchas to Handle

- **MSW must init before first fetch** — gate rendering on `bootstrapMocks()` completion
- **MSW polyfill order** — `fast-text-encoding` + `react-native-url-polyfill` must import before `msw/native`
- **Bottom sheet + map gesture conflict** — use `BottomSheetFlatList`, consider disabling map scroll when sheet is expanded
- **Android location can hang** — use `getLastKnownPositionAsync()` first, `getCurrentPositionAsync` with timeout fallback
- **react-native-maps on Android** — needs Google Maps API key for Google Maps provider. Apple Maps on iOS needs nothing. For dev, we can use the default provider (Apple on iOS, Google on Android).
- **@gorhom/bottom-sheet** — verify v5 compatibility with current Expo SDK; fall back to v4 if needed.

---

## Verification Plan

1. **App boots**: Both platforms show map centered on user location (or Prague fallback)
2. **Mode switching**: Tapping mode chips zooms map, markers change to match distance mode
3. **Price markers**: Styled price bubbles visible on map, tappable
4. **Bottom sheet**: Swipe up to see destination cards, tap card or marker to select
5. **Time selection**: After destination pick, TimeSheet shows 6 time options with per-pax prices
6. **Pax selection**: After time pick, PaxSheet allows adding adults/children, total group price updates live
7. **Search**: "Search journeys" navigates to results tab with mock journey cards
8. **Sort**: Cheapest/fastest toggle reorders results
9. **Full flow**: Complete KAM → KDY → KOLIK → Results end-to-end on both iOS + Android
