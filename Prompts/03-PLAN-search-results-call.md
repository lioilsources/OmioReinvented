# Plan: Real GoEuro Search API in Bottom Sheet

## Context

Currently when a user clicks a destination marker, the bottom sheet shows a static destination list. The user wants to replace this with a real-time search flow: clicking a marker triggers the b2b-platform search API (tomorrow, all travel modes), polls for results, and progressively shows journeys sorted by departure time directly in the bottom sheet.

API source: b2b-platform OpenAPI spec at `.cursor/worktrees/b2b-platform/qjt/generated/private/open_api_v3/openapi.yaml`.

## API Contract (from OpenAPI spec)

### POST `/search/without-offers` — Trigger search

Request body (`SearchRequest`, camelCase):
```json
{
  "from": { "id": "376217" },
  "to": { "id": "376367" },
  "outboundDateTime": "2026-03-21T08:00:00Z",
  "currency": "EUR",
  "locale": "cs",
  "travelModes": ["train", "bus", "flight"],
  "travellers": [{ "age": 30 }],
  "timeoutSeconds": 10
}
```

Response (`SearchWithoutOffersRESTResponse`):
```json
{
  "searchId": "uuid",
  "status": "running" | "done" | "queued",
  "currency": "EUR",
  "journeys": [ JourneyWithoutOffers... ],
  "carriers": [ { "id": "7", "name": "Renfe", "logoUrl": "..." } ... ],
  "segments": [ Segment... ],
  "positions": [ { "id": "319631", "name": "London Euston", "cityName": "London" } ... ]
}
```

### GET `/search/without-offers/{searchId}` — Poll results

Same response type. Poll while `status === "running"`.

### Key Models

**JourneyWithoutOffers:**
- `id: string`
- `cheapestPriceCents: number` (int64, e.g. 25000 = €250.00)
- `outbound: JourneyOutbound`

**JourneyOutbound:**
- `departureTime: string` (ISO datetime)
- `arrivalTime: string` (ISO datetime)
- `durationMinutes: number`
- `carrierId: string` → lookup in `carriers[]` by id
- `travelMode: "train" | "bus" | "flight" | "ferry"`
- `segmentIds: number[]` → lookup in `segments[]`
- `price: number` (cents incl. markup)

**Segment:**
- `id, departureTime, arrivalTime, departurePositionId, arrivalPositionId`
- `durationMinutes, carrierId, direction`

**SearchCarrier:** `{ id, name, logoUrl }`

**PositionSearch:** `{ id, name, cityName }`

## Changes Overview

| # | File | Action |
|---|------|--------|
| 1 | `src/api/client.ts` | Add `apiPost<T>()` |
| 2 | `src/api/search.ts` | **New** — `triggerSearch()` + `pollSearchResults()` + types |
| 3 | `src/api/searchMapper.ts` | **New** — map response → `Journey[]`, resolve position names from `positions[]` |
| 4 | `src/features/map/hooks/useSearchPolling.ts` | **New** — trigger → poll → progressive results |
| 5 | `src/stores/useUIStore.ts` | Simplify `ActiveSheet` to only `'journeys'` |
| 6 | `src/features/map/components/JourneySheet.tsx` | **New** — bottom sheet journey list |
| 7 | `src/features/map/components/MapBottomSheet.tsx` | Simplified — only renders `JourneySheet` |
| 8 | `app/(tabs)/map.tsx` | Wire marker tap → search → bottom sheet |
| 9 | `app/(tabs)/_layout.tsx` | Hide tab bar (single screen app) |
| 10 | `src/shared/components/TransportIcon.tsx` | Use Ionicons instead of emoji |
| 11 | `src/features/results/hooks/useJourneySort.ts` | Add `'timetable'` sort mode |
| 12 | `src/features/results/components/JourneyFilterBar.tsx` | Add Timetable chip |

## Removed Views

- **DestinationList** — bottom sheet destination list (deleted)
- **TimeSheet** — "When do you want to go" + `src/features/time/` (deleted)
- **PaxSheet** — "How many travelers" + `src/features/passengers/` (deleted)
- **Results tab** — `app/(tabs)/results.tsx` (deleted)
- **Tab bar** — hidden, only map screen remains

## Detailed Steps

### 1. `src/api/client.ts` — Add POST

Add `apiPost<T>(path, body)`. Same `API_BASE_URL`, `BEARER_TOKEN`, `User-Agent`. Adds `Content-Type: application/json`, method `POST`. Same dev logging pattern.

### 2. `src/api/search.ts` — API calls + types

Types (all camelCase, matching OpenAPI spec):
```ts
interface SearchCarrier { id: string; name: string; logoUrl: string; }
interface SearchPosition { id: string; name: string; cityName?: string; }

interface SearchOutbound {
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  carrierId: string;
  travelMode: string;
  segmentIds?: number[];
  price?: number;
}

interface SearchJourney {
  id: string;
  cheapestPriceCents: number;
  outbound: SearchOutbound;
}

interface SearchSegment {
  id: string;
  departureTime: string;
  arrivalTime: string;
  departurePositionId?: string;
  arrivalPositionId?: string;
  carrierId: string;
  durationMinutes: number;
}

interface SearchResponse {
  searchId: string;
  status: 'running' | 'done' | 'queued';
  currency: string;
  journeys?: SearchJourney[];
  carriers?: SearchCarrier[];
  segments?: SearchSegment[];
  positions?: SearchPosition[];
}
```

Functions:
- **`triggerSearch(fromId, toId, dateISO, travelModes)`** → POST `/search/without-offers` → returns `SearchResponse`
- **`pollSearchResults(searchId)`** → GET `/search/without-offers/{searchId}` → returns `SearchResponse`

### 3. `src/api/searchMapper.ts` — Response → Journey[]

Flat mapping with position name resolution:
```
journey.id        ← searchJourney.id
journey.departure ← outbound.departureTime
journey.arrival   ← outbound.arrivalTime
journey.duration  ← outbound.durationMinutes
journey.price     ← searchJourney.cheapestPriceCents / 100
journey.provider  ← carriers.find(c => c.id === outbound.carrierId)?.name
journey.transportType ← outbound.travelMode
journey.legs      ← map segmentIds → segments[], resolve from/to via positions[]
```

Position names resolved from `positions[]` array using `departurePositionId`/`arrivalPositionId`.

### 4. `src/features/map/hooks/useSearchPolling.ts`

```ts
useSearchPolling({ fromId, toId, travelModes, enabled })
  → { journeys, isPolling, isComplete, error }
```

1. On `enabled` + input change → POST trigger (with `timeoutSeconds: 10`) → get initial `SearchResponse`
2. If `status === 'running'` → React Query `useQuery` with `refetchInterval: 2000` polls GET
3. `refetchInterval` returns `false` when `status === 'done'` or poll count >= 30
4. Each response is mapped to `Journey[]` via `searchMapper`
5. Input change resets: new `searchId`, cancels old poll

### 5. `src/stores/useUIStore.ts`

`ActiveSheet` simplified to only `'journeys'`, default is `'journeys'`.

### 6. `src/features/map/components/JourneySheet.tsx`

Uses `BottomSheetFlatList` (gesture compat). Reuses:
- `JourneyCard` from `src/features/results/components/JourneyCard.tsx`
- `JourneyFilterBar` with Timetable/Cheapest/Fastest tabs
- `useJourneySort` with default `'timetable'`

Layout:
- Header: "Origin → {dest.name}" + "{N} journeys" / "Searching..."
- Empty state: "Select a destination on the map" (when no destination selected)
- List: JourneyCard items

### 7. `src/features/map/components/MapBottomSheet.tsx`

Simplified — only renders `JourneySheet`, snap points `['15%', '50%', '90%']`.

### 8. `app/(tabs)/map.tsx` — Integration

- `handleMarkerPress` → `setHighlightedId(dest.id)` + `setDestination(dest)` (triggers search)
- `useSearchPolling` with `enabled: !!destination`
- Pass `{ journeys, isPolling, destination, originName }` to `MapBottomSheet`

### 9. TransportIcon — Ionicons

Replaced emoji with Ionicons (same icon font as daytime slider and POI slider):
- train → `train`, bus → `bus`, flight → `airplane`, tram → `train-outline`, ferry → `boat`

### 10. Sort modes

Added `'timetable'` sort (by departure time) alongside existing cheapest/fastest.
JourneySheet defaults to timetable; JourneyFilterBar shows all 3 chips.

## Reused Existing Code

- `JourneyCard` (`src/features/results/components/JourneyCard.tsx`)
- `JourneyFilterBar` + `useJourneySort` (`src/features/results/`)
- `apiGet` pattern (`src/api/client.ts`)
- `DEFAULT_CURRENCY`, `DEFAULT_LOCALE` (`src/api/config.ts`)
- `Ionicons` from `@expo/vector-icons` (same as DaytimeSlider, PoiTypeSlider)
- Theme constants (`src/shared/constants/theme.ts`)

## Verification

1. Click destination marker → bottom sheet shows "Searching...", then journeys appear progressively
2. Each journey: departure HH:MM, provider name (Ionicons icon), duration, price in EUR
3. Sort by timetable/cheapest/fastest works
4. Click different marker → old search cancelled, new one starts
5. No tab bar visible, single screen experience
6. Segment legs show real station names from positions list
7. `npx tsc --noEmit` compiles clean (ignoring pre-existing @expo/vector-icons errors)
