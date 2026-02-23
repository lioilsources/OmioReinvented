import { http, HttpResponse } from 'msw';
import { mockDestinations } from '../data/destinations';
import { generateJourneys } from '../data/journeys';
import type { TimeMode } from '@/shared/types';

function getDateForTimeMode(mode: TimeMode): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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
      // Next Czech public holiday approximation
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

export const journeyHandlers = [
  http.get('https://api.mock/api/journeys', ({ request }) => {
    const url = new URL(request.url);
    const destinationId = url.searchParams.get('destinationId');
    const timeMode = url.searchParams.get('timeMode') as TimeMode | null;

    if (!destinationId) {
      return HttpResponse.json({ error: 'destinationId required' }, { status: 400 });
    }

    const destination = mockDestinations.find((d) => d.id === destinationId);
    if (!destination) {
      return HttpResponse.json({ error: 'destination not found' }, { status: 404 });
    }

    const date = timeMode ? getDateForTimeMode(timeMode) : getDateForTimeMode('tomorrow');
    const journeys = generateJourneys(
      destination.id,
      destination.name,
      destination.transportTypes,
      destination.priceFrom,
      date
    );

    return HttpResponse.json(journeys);
  }),
];
