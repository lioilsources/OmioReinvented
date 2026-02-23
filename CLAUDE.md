# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web
```

No test runner is configured yet. No linter/formatter is configured yet.

## Architecture

Map-first travel exploration app built with React Native + Expo. Users progressively narrow a journey through 3 steps on a single persistent map screen: **KAM** (where) → **KDY** (when) → **KOLIK** (how many) → results.

### Routing (Expo Router)

`app/_layout.tsx` is the root — wraps everything in GestureHandlerRootView, QueryProvider, BottomSheetModalProvider, and gates rendering on MSW mock initialization. Two tabs: map (primary) and results.

### Feature-Based Source Layout (`src/`)

Each feature under `src/features/` has `components/`, `hooks/`, and optionally `utils/`. The four features are:
- **map** — MapView, mode selector, destination markers with price bubbles, bottom sheet with destination list
- **time** — Time mode grid (6 options), prices per pax from `destination.prices_by_when`
- **passengers** — Adult/child counters, age-based pricing (under 6 free, 6-14 half, 15+ full)
- **results** — Journey list with cheapest/fastest sort toggle

### Single-Screen Sheet Swapping

All 3 search steps live on MapScreen. The bottom sheet (`@gorhom/bottom-sheet`) swaps content based on `useUIStore.activeSheet` — no screen navigation between steps. The map stays visible throughout.

### State Management (Zustand)

- **`useSearchStore`** — Search parameters (origin, distanceMode, destination, timeMode, pax) + derived price methods (`getPricePerPax`, `getTotalPrice`)
- **`useUIStore`** — UI-only state (activeSheet, mapInteracting) kept separate to avoid re-renders during map panning

### API Layer + MSW Mocks

`src/api/client.ts` has a single `apiGet<T>()` fetch wrapper hitting `https://api.mock`. In dev, MSW (`msw/native`) intercepts all requests transparently. Mock handlers serve ~30 destinations from Prague and generate journeys deterministically.

**Critical init order:** polyfills (`fast-text-encoding`, `react-native-url-polyfill`) must import before `msw/native`. `bootstrapMocks()` must complete before any fetch call — the root layout gates rendering on this.

### Path Aliases

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `babel.config.js` via `babel-plugin-module-resolver`).

### Types

Centralized in `src/shared/types/`. Key types: `DistanceMode`, `TimeMode`, `TransportType`, `Destination` (includes `prices_by_when` map), `Journey`, `JourneyLeg`, `PaxConfig`, `Child`.

### Mode System

Distance modes (`short`/`medium`/`long`/`extra-long`) drive both map zoom level and transport type filtering. Config lives in `src/features/map/utils/modeConfig.ts`.

### Key Gotchas

- Bottom sheet + map gesture conflicts — use `BottomSheetFlatList` for scrollable content inside sheets
- Android location can hang — `getLastKnownPositionAsync()` is used first with `getCurrentPositionAsync` as fallback
- All deps are Expo Go compatible — no custom dev client needed
- Prague is the hardcoded fallback origin when location permission is denied
