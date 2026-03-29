import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

// GET /api/pg/[id]/availability - Real-time room availability for a PG
// Used by SWR for client-side caching, called on customer-facing pages
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const pg = await prisma.pG.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        totalRooms: true,
        availableRooms: true,
        rooms: {
          where: { isActive: true },
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            maxOccupancy: true,
            currentOccupancy: true,
            availabilityStatus: true,
            monthlyRent: true,
            securityDeposit: true,
            maintenanceCharges: true,
          },
          orderBy: { roomNumber: 'asc' },
        },
      },
    });

    if (!pg) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: pg.id,
      totalRooms: pg.totalRooms,
      availableRooms: pg.availableRooms,
      rooms: pg.rooms.map((room) => ({
        ...room,
        monthlyRent: Number(room.monthlyRent),
        securityDeposit: Number(room.securityDeposit),
        maintenanceCharges: Number(room.maintenanceCharges),
      })),
    });
  } catch (error) {
    console.error('Error fetching PG availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 },
    );
  }
}
