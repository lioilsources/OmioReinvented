import { dbApiGet } from './client';

interface DbPosition {
  id: string;
  population?: number;
}

export async function getPositionsPopulation(
  positionIds: string[],
): Promise<Map<string, number>> {
  const params = new URLSearchParams();
  for (const id of positionIds) {
    params.append('positionId', id);
  }

  const positions = await dbApiGet<DbPosition[]>(
    'pelican/v3/positions',
    params,
  );

  const populationMap = new Map<string, number>();
  for (const pos of positions) {
    if (pos.population != null) {
      populationMap.set(pos.id, pos.population);
    }
  }
  return populationMap;
}
