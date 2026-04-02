import { getActiveContactDetails } from '@/lib/sanity/queries/contactDetails';
import { getRoomsPageData } from '@/lib/sanity/queries/roomSection';
import { Rooms } from '@/components/pages/Rooms';
import { prisma } from '@/prisma';

// Revalidate content every 60 seconds (ISR)
export const revalidate = 60;

export default async function RoomsPage() {
  const [{ rooms, pricingIncludesSection }, contactDetails] = await Promise.all(
    [getRoomsPageData(), getActiveContactDetails()],
  );

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
      availabilityStatus: liveRoom.availabilityStatus,
    };
  });

  return (
    <Rooms
      data={mergedRooms}
      pricingIncludesSection={pricingIncludesSection}
      contactDetails={contactDetails}
    />
  );
}

