import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

// GET /api/bookings/validate - Real-time price & availability check from backend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pgId = searchParams.get('pgId');
    const roomId = searchParams.get('roomId');

    if (!pgId && !roomId) {
      return NextResponse.json(
        { error: 'pgId or roomId is required' },
        { status: 400 },
      );
    }

    // If roomId is provided, get specific room data
    if (roomId) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
          id: true,
          roomNumber: true,
          roomType: true,
          monthlyRent: true,
          securityDeposit: true,
          maintenanceCharges: true,
          maxOccupancy: true,
          currentOccupancy: true,
          availabilityStatus: true,
          electricityIncluded: true,
          pg: {
            select: {
              id: true,
              name: true,
              startingPrice: true,
              securityDeposit: true,
              brokerageCharges: true,
              availableRooms: true,
            },
          },
        },
      });

      if (!room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        room: {
          id: room.id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          monthlyRent: Number(room.monthlyRent),
          securityDeposit: Number(room.securityDeposit),
          maintenanceCharges: Number(room.maintenanceCharges),
          maxOccupancy: room.maxOccupancy,
          currentOccupancy: room.currentOccupancy,
          availabilityStatus: room.availabilityStatus,
          electricityIncluded: room.electricityIncluded,
          isAvailable: room.availabilityStatus === 'AVAILABLE',
          spotsLeft: room.maxOccupancy - room.currentOccupancy,
        },
        pg: room.pg
          ? {
              id: room.pg.id,
              name: room.pg.name,
              startingPrice: Number(room.pg.startingPrice),
              securityDeposit: Number(room.pg.securityDeposit),
              brokerageCharges: Number(room.pg.brokerageCharges),
              availableRooms: room.pg.availableRooms,
            }
          : null,
        timestamp: new Date().toISOString(),
      });
    }

    // If only pgId is provided, get PG with available room summary
    if (pgId) {
      const pg = await prisma.pG.findUnique({
        where: { id: pgId },
        select: {
          id: true,
          name: true,
          startingPrice: true,
          securityDeposit: true,
          brokerageCharges: true,
          totalRooms: true,
          availableRooms: true,
        },
      });

      if (!pg) {
        return NextResponse.json(
          { error: 'PG not found' },
          { status: 404 },
        );
      }

      const roomSummary = await prisma.room.groupBy({
        by: ['roomType', 'availabilityStatus'],
        where: { pgId },
        _count: { id: true },
        _min: { monthlyRent: true },
        _max: { monthlyRent: true },
      });

      const availableRooms = await prisma.room.findMany({
        where: { pgId, availabilityStatus: 'AVAILABLE' },
        select: {
          id: true,
          roomNumber: true,
          roomType: true,
          monthlyRent: true,
          securityDeposit: true,
          maxOccupancy: true,
          currentOccupancy: true,
        },
        orderBy: { monthlyRent: 'asc' },
      });

      return NextResponse.json({
        pg: {
          id: pg.id,
          name: pg.name,
          startingPrice: Number(pg.startingPrice),
          securityDeposit: Number(pg.securityDeposit),
          brokerageCharges: Number(pg.brokerageCharges),
          totalRooms: pg.totalRooms,
          availableRooms: pg.availableRooms,
        },
        roomSummary: roomSummary.map((s) => ({
          roomType: s.roomType,
          availabilityStatus: s.availabilityStatus,
          count: s._count.id,
          minRent: s._min.monthlyRent ? Number(s._min.monthlyRent) : 0,
          maxRent: s._max.monthlyRent ? Number(s._max.monthlyRent) : 0,
        })),
        availableRooms: availableRooms.map((r) => ({
          id: r.id,
          roomNumber: r.roomNumber,
          roomType: r.roomType,
          monthlyRent: Number(r.monthlyRent),
          securityDeposit: Number(r.securityDeposit),
          maxOccupancy: r.maxOccupancy,
          currentOccupancy: r.currentOccupancy,
          spotsLeft: r.maxOccupancy - r.currentOccupancy,
        })),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error validating booking data:', error);
    return NextResponse.json(
      { error: 'Failed to validate booking data' },
      { status: 500 },
    );
  }
}
