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
  const params = {
    fromId: FROM_POSITION_ID,
    toId,
    outboundDateStart,
    travelModes,
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    adults: '1',
  };

  if (__DEV__) console.log(`[Discovery] ${FROM_POSITION_ID} → ${toId}, date=${outboundDateStart}, modes=${travelModes}`);

  const resp = await apiGet<DiscoveryResponse>('/discovery/results/batch', params);

  if (resp.errors?.length) {
    if (__DEV__) console.log(`[Discovery] ${toId} errors: ${resp.errors.map((e) => e.message).join(', ')}`);
  }

  if (!resp.data || resp.data.length === 0) {
    if (__DEV__) console.log(`[Discovery] ${toId} → no data`);
    return null;
  }

  let globalMin = Infinity;
  let totalSchedules = 0;

  for (const result of resp.data) {
    if (!result.outboundSchedules) continue;
    for (const schedule of result.outboundSchedules) {
      totalSchedules++;
      if (schedule.priceCents && schedule.priceCents > 0 && schedule.priceCents < globalMin) {
        globalMin = schedule.priceCents;
      }
    }
  }

  const price = globalMin === Infinity ? null : globalMin / 100;
  if (__DEV__) console.log(`[Discovery] ${toId} → ${resp.data.length} results, ${totalSchedules} schedules, min=${price ?? 'none'}`);

  return price;
}
