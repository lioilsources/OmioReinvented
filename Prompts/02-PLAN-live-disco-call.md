# 02 — Live Disco Call: Mock → Real Omio API

## Cíl

Nahradit mockovaná data reálnými API voláními na Omio B2B platformu. Positions API pro zobrazení destinací na mapě, Discovery Batch API pro ceny. Journey results zůstávají mockované (fáze 2).

## Dva reálné endpointy

### 1. Positions (`GET /positions`)
- Input: střed mapy (lat/lon), locale, format
- Output: `Position[]` s `{ id, name, translatedName, type, latitude, longitude, countryCode }`
- Filtruje se lokálně na `type === "station"` + bounding box viewportu
- Limit na 15 pozic

### 2. Discovery Results Batch (`GET /discovery-results/batch`)
- Input: `fromID`, `toID`, `outboundDateStart`, `travelModes`, `locale`, `currency`, `adults`
- Output: `{ data: [{ departureDate, outboundSchedules: [{ priceCents }] }] }`
- Parsuje se na nejlevnější cenu v EUR (priceCents / 100)
- Volá se paralelně pro každou pozici ve viewportu

## Rozhodnutí

- **Bearer token**: hardcoded v `.env`, v `.gitignore`
- **Base URL**: QA (`api.qa.goeuro.ninja/v2`) default, prod přepínatelné v `src/api/config.ts`
- **From position**: Praha hl.n. (`16842359`) — staticky, dynamické v další fázi
- **Distance mode → travelModes**:
  - `short` → `bus,train`
  - `medium` → `train`
  - `long` → `train,flight`
  - `extra-long` → `flight`
- **Journey results**: zůstávají mockované — generátor (`src/mocks/data/journeys.ts`) se importuje přímo z `src/api/journeys.ts`
- **TimeModeGrid**: zobrazuje `priceFrom` z disco pro všechny time mody (per-timeMode pricing zatím nemáme)

## Architektonické změny

| Součást | Před (mock) | Po (API) |
|---|---|---|
| API client | `https://api.mock`, žádná auth | `api.qa.goeuro.ninja/v2`, Bearer token |
| Destinace | `getDestinations(mode)` dle DistanceMode | `getPositions(bounds)` dle map viewport |
| Cenové bubliny | statické `priceFrom` / `prices_by_when` | Discovery Batch API per pozice |
| `useDestinations(mode)` | query key `['destinations', mode]` | `usePositions(bounds)` + `useDestinationPrices(positions, mode)` |
| `Destination` typ | id, name, lat, lng, priceFrom, popularity, modes, imageUrl, transportTypes, prices_by_when | id, name, lat, lng, country, priceFrom (nullable) |
| Mock server | globální fetch override v `src/mocks/server.ts` | smazán |

## Implementace

### Nové soubory
- `src/api/config.ts` — base URL, bearer, fromPositionId, travelModes mapping
- `src/api/positions.ts` — `getPositions(bounds)` volá Positions API
- `src/api/discovery.ts` — `getDiscoveryPrice(toId, date, travelModes)` volá Discovery API
- `src/shared/types/position.ts` — `Position` + `MapBounds` typy
- `src/features/map/hooks/usePositions.ts` — bounds → positions → Destination[]
- `src/features/map/hooks/useDestinationPrices.ts` — paralelní disco calls → Map<id, price>
- `.env` — bearer token (v .gitignore)

### Upravené soubory
- `src/api/client.ts` — base URL z configu, Authorization header
- `src/shared/types/destination.ts` — zjednodušen na 6 polí
- `src/shared/types/index.ts` — export Position + MapBounds
- `app/(tabs)/map.tsx` — usePositions + useDestinationPrices, bounds debounce (500ms)
- `src/features/map/components/MapViewContainer.tsx` — `onBoundsChange` z `onRegionChangeComplete`
- `src/features/map/components/DestinationMarkers.tsx` — bez departureTime
- `src/features/map/components/PriceBubbleMarker.tsx` — nullable price → "..."
- `src/features/map/components/DestinationCard.tsx` — bez imageUrl, transportTypes
- `src/features/map/components/DestinationList.tsx` — řazení dle jména
- `src/features/time/components/TimeModeGrid.tsx` — priceFrom místo prices_by_when
- `src/features/time/components/TimeModeChip.tsx` — price optional
- `src/stores/useSearchStore.ts` — getPricePerPax bere jen priceFrom
- `src/api/journeys.ts` — přímo importuje generátor
- `src/features/results/hooks/useJourneys.ts` — destinations param pro browse
- `app/_layout.tsx` — odstraněn mock bootstrap
- `.gitignore` — přidán `.env`

### Smazané soubory
- `src/mocks/server.ts`
- `src/mocks/index.ts`
- `src/mocks/data/destinations.ts`
- `src/api/destinations.ts`
- `src/features/map/hooks/useDestinations.ts`
- `src/features/map/utils/daytimePrice.ts`

### Zachováno
- `src/mocks/data/journeys.ts` — journey generátor (importován přímo)

## Data flow

```
Mapa reportuje bounds (onRegionChangeComplete)
    ↓ debounce 500ms
usePositions(bounds) → GET /positions?lat={center}&lon={center}&locale=cs&format=json
    ↓ filtr type=station + bbox, limit 15
Destination[] s priceFrom: null → markery zobrazí "..."
    ↓
useDestinationPrices(positions, distanceMode) → N× GET /discovery-results/batch
    ↓ paralelní Promise.allSettled
Map<id, price> → merge do Destination[] → markery zobrazí "€X"
    ↓
Klik na destinaci → setDestination → TimeSheet (priceFrom pro všechny mody)
    ↓
Journey results = mockované (generátor s transport types z modeConfig)
```

## Reference

Reálné API volání vychází z Go PoC v `../vibe-code/omio-reinvented/main.go`:
- `findPositionsInBBox()` — positions endpoint s bbox filtrací
- `fetchCheapestPricesBatch()` — discovery-results s cenovou extrakcí

## Další kroky (fáze 2+)

- Dynamický "from" position (UX pro změnu origin)
- Per-TimeMode ceny z disco (6 datumů = 6 disco calls per destinace)
- Reálný journey search endpoint (nahrazení generátoru)
- Deduplikace stanic dle jména (API vrací více stanic per město)
- Rate limiting / caching strategie pro disco calls
