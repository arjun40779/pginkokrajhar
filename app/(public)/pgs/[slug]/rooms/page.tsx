import { notFound } from 'next/navigation';
import { Rooms } from '@/components/pages/Rooms';
import { getActiveLivePublicPG } from '@/lib/pgs/live';
import { getActiveContactDetails } from '@/lib/sanity/queries/contactDetails';
import { getPGByDbId, getPGBySlug } from '@/lib/sanity/queries/pgSection';
import { getRoomsPageDataByPG } from '@/lib/sanity/queries/roomSection';
import { normalizeRoomAvailabilityStatus } from '@/lib/rooms/availability';
import { prisma } from '@/prisma';

export const revalidate = 60;

interface Props {
  params: Readonly<{ slug: string }>;
}

export default async function PGRoomsPage({ params }: Readonly<Props>) {
  const [pgBySlug, contactDetails] = await Promise.all([
    getPGBySlug(params.slug),
    getActiveContactDetails(),
  ]);
  // Fallback: if no PG found by slug, treat the slug as a DB ID
  const pg = pgBySlug ?? (await getPGByDbId(params.slug));

  if (!pg?.dbId) {
    notFound();
  }

  const livePG = await getActiveLivePublicPG(pg.dbId);

  if (!livePG) {
    notFound();
  }

  const { rooms, pricingIncludesSection } = await getRoomsPageDataByPG(pg.dbId);

  const roomIds = rooms
    .map((room) => room.dbId)
    .filter((roomId): roomId is string => Boolean(roomId));

  const liveRooms = roomIds.length
    ? await prisma.room.findMany({
        where: {
          id: {
            in: roomIds,
          },
        },
        select: {
          id: true,
          maxOccupancy: true,
          currentOccupancy: true,
          availabilityStatus: true,
          monthlyRent: true,
          securityDeposit: true,
        },
      })
    : [];

  const liveRoomMap = new Map(liveRooms.map((room) => [room.id, room]));

  const mergedRooms = rooms.map((room) => {
    const liveRoom = liveRoomMap.get(room.dbId);

    if (!liveRoom) {
      return room;
    }

    return {
      ...room,
      maxOccupancy: liveRoom.maxOccupancy,
      currentOccupancy: liveRoom.currentOccupancy,
      availabilityStatus: normalizeRoomAvailabilityStatus(
        liveRoom.availabilityStatus,
        liveRoom.currentOccupancy,
        liveRoom.maxOccupancy,
      ),
      monthlyRent: Number(liveRoom.monthlyRent),
      securityDeposit: Number(liveRoom.securityDeposit),
    };
  });

  return (
    <Rooms
      data={mergedRooms}
      pricingIncludesSection={pricingIncludesSection}
      contactDetails={contactDetails}
      title={`${pg.name} Rooms`}
      description={`Browse all rooms currently listed for ${pg.name} in ${pg.area}, ${pg.city}.`}
    />
  );
}

