import type { DepartureTime } from '@/shared/types';

const multipliers: Record<DepartureTime, number> = {
  morning: 0.8,
  afternoon: 1.3,
  evening: 1.0,
};

export function getDaytimePrice(basePrice: number, departureTime: DepartureTime): number {
  return Math.round(basePrice * multipliers[departureTime]);
}
