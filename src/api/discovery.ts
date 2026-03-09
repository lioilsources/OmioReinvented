import { apiGet } from './client';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from './config';
import type { DepartureTime } from '@/shared/types';

interface DiscoverySchedule {
  priceCents?: number;
  departureAt?: string;
}

interface DiscoveryResult {
  departureDate?: string;
  outboundSchedules?: DiscoverySchedule[];
}

interface DiscoveryResponse {
  data?: DiscoveryResult[];
  errors?: { type?: string; message?: string }[];
}

export type DaytimePrices = Record<DepartureTime, number | null>;

export async function getDiscoveryPrice(
  fromId: string,
  toId: string,
  outboundDateStart: string,
  travelModes: string,
): Promise<number | null> {
  const params = {
    fromId,
    toId,
    outboundDateStart,
    travelModes,
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    adults: '1',
  };

  if (__DEV__) console.log(`[Discovery] ${fromId} → ${toId}, date=${outboundDateStart}, modes=${travelModes}`);

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

function getDaytimeBucket(departureAt: string): DepartureTime {
  const hour = new Date(departureAt).getHours();
  if (hour < 11) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export async function getDiscoveryPricesByDaytime(
  fromId: string,
  toId: string,
  outboundDateStart: string,
  travelModes: string,
): Promise<DaytimePrices> {
  const params = {
    fromId,
    toId,
    outboundDateStart,
    travelModes,
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    adults: '1',
  };

  if (__DEV__) console.log(`[Discovery/daytime] ${fromId} → ${toId}, date=${outboundDateStart}, modes=${travelModes}`);

  const resp = await apiGet<DiscoveryResponse>('/discovery/results/batch', params);

  if (resp.errors?.length) {
    if (__DEV__) console.log(`[Discovery/daytime] ${toId} errors: ${resp.errors.map((e) => e.message).join(', ')}`);
  }

  const bucketMins: Record<DepartureTime, number> = {
    morning: Infinity,
    afternoon: Infinity,
    evening: Infinity,
  };

  if (resp.data) {
    for (const result of resp.data) {
      if (!result.outboundSchedules) continue;
      for (const schedule of result.outboundSchedules) {
        if (!schedule.priceCents || schedule.priceCents <= 0) continue;
        if (schedule.departureAt) {
          const bucket = getDaytimeBucket(schedule.departureAt);
          if (schedule.priceCents < bucketMins[bucket]) {
            bucketMins[bucket] = schedule.priceCents;
          }
        } else {
          // No departureAt — count towards all buckets
          for (const key of ['morning', 'afternoon', 'evening'] as DepartureTime[]) {
            if (schedule.priceCents < bucketMins[key]) {
              bucketMins[key] = schedule.priceCents;
            }
          }
        }
      }
    }
  }

  const result: DaytimePrices = {
    morning: bucketMins.morning === Infinity ? null : bucketMins.morning / 100,
    afternoon: bucketMins.afternoon === Infinity ? null : bucketMins.afternoon / 100,
    evening: bucketMins.evening === Infinity ? null : bucketMins.evening / 100,
  };

  if (__DEV__) console.log(`[Discovery/daytime] ${toId} → morning=${result.morning}, afternoon=${result.afternoon}, evening=${result.evening}`);

  return result;
}
