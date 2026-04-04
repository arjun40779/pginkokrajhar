import { redirect } from 'next/navigation';
import BookingPageClient from './BookingPageClient';
import { isRoomAvailableForBooking } from '@/lib/rooms/availability';
import { prisma } from '@/prisma';

type BookingPageProps = {
  searchParams?: {
    pgId?: string | string[];
    roomId?: string | string[];
  };
};

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function BookingPage({
  searchParams,
}: Readonly<BookingPageProps>) {
  const pgId = getSingleSearchParam(searchParams?.pgId);
  const roomId = getSingleSearchParam(searchParams?.roomId);

  if (roomId) {
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        isActive: true,
        ...(pgId ? { pgId } : {}),
      },
      select: {
        pgId: true,
        availabilityStatus: true,
        currentOccupancy: true,
        maxOccupancy: true,
      },
    });

    if (
      !room ||
      !isRoomAvailableForBooking(
        room.availabilityStatus,
        room.currentOccupancy,
        room.maxOccupancy,
      )
    ) {
      redirect('/pgs');
    }

    return <BookingPageClient initialPgId={room.pgId} initialRoomId={roomId} />;
  }

  return <BookingPageClient initialPgId={pgId} initialRoomId={roomId} />;
}

