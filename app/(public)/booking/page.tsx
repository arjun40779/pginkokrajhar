import { redirect } from 'next/navigation';
import BookingPageClient from './BookingPageClient';
import { isRoomAvailableForBooking } from '@/lib/rooms/availability';
import { prisma } from '@/prisma';
import { client } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

type BookingPageProps = {
  searchParams?: {
    pgId?: string | string[];
    roomId?: string | string[];
  };
};

interface RulesSection {
  heading: string;
  rules: string[];
}

interface RulesData {
  sections: RulesSection[];
  declaration: string;
}

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function fetchRulesForPG(pgId: string): Promise<RulesData | null> {
  const pg = await prisma.pG.findUnique({
    where: { id: pgId },
    select: { sanityDocumentId: true },
  });

  if (!pg?.sanityDocumentId) return null;

  const result = await client.fetch<RulesData | null>(
    `*[_type == "pg" && _id == $sanityId][0]{
      "rules": rulesRegulations->{
        "sections": sections[]{heading, rules},
        declaration
      }
    }.rules`,
    { sanityId: pg.sanityDocumentId },
  );

  if (!result?.sections?.length) return null;

  return result;
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

    const rules = await fetchRulesForPG(room.pgId);

    return (
      <BookingPageClient
        initialPgId={room.pgId}
        initialRoomId={roomId}
        rules={rules}
      />
    );
  }

  const rules = pgId ? await fetchRulesForPG(pgId) : null;

  return (
    <BookingPageClient
      initialPgId={pgId}
      initialRoomId={roomId}
      rules={rules}
    />
  );
}

