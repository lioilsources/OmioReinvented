import { http, HttpResponse } from 'msw';
import { mockDestinations } from '../data/destinations';
import type { DistanceMode } from '@/shared/types';

export const destinationHandlers = [
  http.get('https://api.mock/api/destinations', ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') as DistanceMode | null;

    let filtered = mockDestinations;
    if (mode) {
      filtered = mockDestinations.filter((d) => d.modes.includes(mode));
    }

    return HttpResponse.json(filtered);
  }),
];
