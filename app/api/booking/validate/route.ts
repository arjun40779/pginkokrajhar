export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import {
  formatRoomAvailabilityLabel,
  isRoomAvailableForBooking,
  normalizeRoomAvailabilityStatus,
} from '@/lib/rooms/availability';

// GET /api/booking/validate?pgId=...&roomId=...
// Real-time validation of price and availability before booking
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pgId = searchParams.get('pgId');
  const roomId = searchParams.get('roomId');

  if (!pgId || !roomId) {
    return NextResponse.json(
      { error: 'pgId and roomId are required' },
      { status: 400 },
    );
  }

  try {
    const room = await prisma.room.findFirst({
      where: { id: roomId, pgId, isActive: true },
      select: {
        id: true,
        roomNumber: true,
        availabilityStatus: true,
        monthlyRent: true,
        securityDeposit: true,
        maintenanceCharges: true,
        maxOccupancy: true,
        currentOccupancy: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { valid: false, reason: 'Room not found or inactive' },
        { status: 404 },
      );
    }

    const available = isRoomAvailableForBooking(
      room.availabilityStatus,
      room.currentOccupancy,
      room.maxOccupancy,
    );
    const normalizedStatus = normalizeRoomAvailabilityStatus(
      room.availabilityStatus,
      room.currentOccupancy,
      room.maxOccupancy,
    );

    return NextResponse.json({
      valid: available,
      pgId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      monthlyRent: Number(room.monthlyRent),
      securityDeposit: Number(room.securityDeposit),
      maintenanceCharges: Number(room.maintenanceCharges),
      availabilityStatus: normalizedStatus,
      reason: available
        ? undefined
        : `Room is currently ${formatRoomAvailabilityLabel(normalizedStatus).toLowerCase()}`,
    });
  } catch (error) {
    console.error('Error validating booking:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}

