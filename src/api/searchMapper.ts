import type { Journey, JourneyLeg, TransportType } from '@/shared/types';
import type { SearchResponse, SearchCarrier, SearchPosition } from './search';

const TRAVEL_MODE_MAP: Record<string, TransportType> = {
  train: 'train',
  bus: 'bus',
  flight: 'flight',
  ferry: 'bus', // fallback
};

function resolveCarrierName(
  carrierId: string,
  carriers: SearchCarrier[],
): string {
  return carriers.find((c) => c.id === carrierId)?.name ?? 'Unknown';
}

function resolvePositionName(
  positionId: string | undefined,
  posMap: Map<string, SearchPosition>,
): string {
  if (!positionId) return '';
  const pos = posMap.get(positionId);
  return pos?.name ?? positionId;
}

function mapTravelMode(mode: string): TransportType {
  return TRAVEL_MODE_MAP[mode] ?? 'bus';
}

export function mapSearchResponse(response: SearchResponse): Journey[] {
  const carriers = response.carriers ?? [];
  const segments = response.segments ?? [];
  const positions = response.positions ?? [];
  const segMap = new Map(segments.map((s) => [s.id, s]));
  const posMap = new Map(positions.map((p) => [p.id, p]));

  return (response.journeys ?? [])
    .map((sj): Journey | null => {
      const ob = sj.outbound;
      if (!ob) return null;

      const provider = resolveCarrierName(ob.carrierId, carriers);
      const transportType = mapTravelMode(ob.travelMode);

      const legs: JourneyLeg[] = (ob.segmentIds ?? [])
        .map((segId) => {
          const seg = segMap.get(String(segId));
          if (!seg) return null;
          const segCarrier = resolveCarrierName(seg.carrierId, carriers);
          const fromPos = seg.departurePositionId ? posMap.get(seg.departurePositionId) : undefined;
          const toPos = seg.arrivalPositionId ? posMap.get(seg.arrivalPositionId) : undefined;
          return {
            from: fromPos?.name ?? seg.departurePositionId ?? '',
            fromLat: fromPos?.lat,
            fromLng: fromPos?.lon,
            to: toPos?.name ?? seg.arrivalPositionId ?? '',
            toLat: toPos?.lat,
            toLng: toPos?.lon,
            departure: seg.departureTime,
            arrival: seg.arrivalTime,
            transportType,
            provider: segCarrier,
          };
        })
        .filter((l): l is JourneyLeg => l !== null);

      // Fallback to a single leg if no segments resolved
      if (legs.length === 0) {
        legs.push({
          from: '',
          to: '',
          departure: ob.departureTime,
          arrival: ob.arrivalTime,
          transportType,
          provider,
        });
      }

      return {
        id: sj.id,
        searchId: response.searchId,
        outboundId: ob.id ?? '',
        provider,
        departure: ob.departureTime,
        arrival: ob.arrivalTime,
        duration: ob.durationMinutes,
        price: sj.cheapestPriceCents / 100,
        legs,
        transportType,
      };
    })
    .filter((j): j is Journey => j !== null)
    .sort((a, b) => a.departure.localeCompare(b.departure));
}
