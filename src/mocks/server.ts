import { mockDestinations } from './data/destinations';
import { generateJourneys } from './data/journeys';
import type { DistanceMode, TimeMode } from '@/shared/types';

function getDateForTimeMode(mode: TimeMode): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (mode) {
    case 'tomorrow': {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return fmt(d);
    }
    case 'next_week': {
      const d = new Date(now);
      const daysUntilMonday = ((8 - d.getDay()) % 7) || 7;
      d.setDate(d.getDate() + daysUntilMonday);
      return fmt(d);
    }
    case 'next_month': {
      const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return fmt(d);
    }
    case 'holidays': {
      const d = new Date(now);
      d.setDate(d.getDate() + 14);
      return fmt(d);
    }
    case 'christmas': {
      const year = now.getMonth() >= 11 ? now.getFullYear() : now.getFullYear();
      return `${year}-12-23`;
    }
    case 'spring_break': {
      const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
      return `${year}-03-15`;
    }
  }
}

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type RouteHandler = (url: URL) => Response;

const routes: Record<string, RouteHandler> = {
  '/api/journeys/browse': (url) => {
    const mode = url.searchParams.get('mode') as DistanceMode | null;
    const filtered = mode
      ? mockDestinations.filter((d) => d.modes.includes(mode))
      : mockDestinations;

    const date = getTomorrowDate();

    // Generate journeys per destination
    const perDest = filtered.map((dest) => {
      const journeys = generateJourneys(
        dest.id,
        dest.name,
        dest.transportTypes,
        dest.priceFrom,
        date,
      );
      return journeys.map((j) => ({
        ...j,
        destinationName: dest.name,
        destinationId: dest.id,
      }));
    });

    // Round-robin interleave
    const result: typeof perDest[0] = [];
    const maxLen = Math.max(...perDest.map((arr) => arr.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (const arr of perDest) {
        if (i < arr.length) result.push(arr[i]);
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  '/api/destinations': (url) => {
    const mode = url.searchParams.get('mode') as DistanceMode | null;
    let filtered = mockDestinations;
    if (mode) {
      filtered = mockDestinations.filter((d) => d.modes.includes(mode));
    }
    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  '/api/journeys': (url) => {
    const destinationId = url.searchParams.get('destinationId');
    const timeMode = url.searchParams.get('timeMode') as TimeMode | null;

    if (!destinationId) {
      return new Response(JSON.stringify({ error: 'destinationId required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const destination = mockDestinations.find((d) => d.id === destinationId);
    if (!destination) {
      return new Response(JSON.stringify({ error: 'destination not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const date = timeMode
      ? getDateForTimeMode(timeMode)
      : getDateForTimeMode('tomorrow');
    const journeys = generateJourneys(
      destination.id,
      destination.name,
      destination.transportTypes,
      destination.priceFrom,
      date,
    );

    return new Response(JSON.stringify(journeys), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

const MOCK_ORIGIN = 'https://api.mock';

export function startMockServer() {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(input.url);

    if (url.origin === MOCK_ORIGIN) {
      const handler = routes[url.pathname];
      if (handler) return handler(url);
    }

    return originalFetch(input, init);
  };
}
