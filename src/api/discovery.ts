import { apiGet } from './client';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE, FROM_POSITION_ID } from './config';

interface DiscoverySchedule {
  priceCents?: number;
}

interface DiscoveryResult {
  departureDate?: string;
  outboundSchedules?: DiscoverySchedule[];
}

interface DiscoveryResponse {
  data?: DiscoveryResult[];
  errors?: { type?: string; message?: string }[];
}

export async function getDiscoveryPrice(
  toId: string,
  outboundDateStart: string,
  travelModes: string,
): Promise<number | null> {
  const resp = await apiGet<DiscoveryResponse>('/discovery/results/batch', {
    fromId: FROM_POSITION_ID,
    toId,
    outboundDateStart,
    travelModes,
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    adults: '1',
  });

  if (!resp.data || resp.data.length === 0) {
    return null;
  }

  let globalMin = Infinity;

  for (const result of resp.data) {
    if (!result.outboundSchedules) continue;
    for (const schedule of result.outboundSchedules) {
      if (schedule.priceCents && schedule.priceCents > 0 && schedule.priceCents < globalMin) {
        globalMin = schedule.priceCents;
      }
    }
  }

  if (globalMin === Infinity) return null;
  return globalMin / 100;
}
