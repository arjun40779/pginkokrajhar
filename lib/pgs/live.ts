import type { SanityPG } from '@/lib/sanity/queries/pgSection';
import { prisma } from '@/prisma';

export interface LivePublicPG {
  id: string;
  isActive: boolean;
  status: string;
  totalRooms: number;
  availableRooms: number;
  startingPrice: unknown;
}

async function getLivePublicPGs(
  dbIds: string[],
): Promise<Map<string, LivePublicPG>> {
  if (dbIds.length === 0) {
    return new Map();
  }

  const livePGs = await prisma.pG.findMany({
    where: {
      id: {
        in: dbIds,
      },
    },
    select: {
      id: true,
      isActive: true,
      status: true,
      totalRooms: true,
      availableRooms: true,
      startingPrice: true,
    },
  });

  return new Map(livePGs.map((pg) => [pg.id, pg]));
}

export async function getActiveLivePublicPG(
  dbId: string,
): Promise<LivePublicPG | null> {
  const livePGs = await getLivePublicPGs([dbId]);
  const livePG = livePGs.get(dbId);

  if (!livePG || !livePG.isActive || livePG.status !== 'ACTIVE') {
    return null;
  }

  return livePG;
}

export async function hydratePGsWithLiveInventory(
  pgs: SanityPG[],
): Promise<SanityPG[]> {
  if (pgs.length === 0) {
    return [];
  }

  const dbIds = pgs
    .map((pg) => pg.dbId)
    .filter((dbId): dbId is string => Boolean(dbId));

  if (dbIds.length === 0) {
    return [];
  }

  const livePGMap = await getLivePublicPGs(dbIds);

  return pgs.flatMap((pg) => {
    const livePG = livePGMap.get(pg.dbId);

    if (!livePG || !livePG.isActive || livePG.status !== 'ACTIVE') {
      return [];
    }

    return [
      {
        ...pg,
        totalRooms: livePG.totalRooms,
        availableRooms: livePG.availableRooms,
        startingPrice: Number(livePG.startingPrice),
      },
    ];
  });
}

