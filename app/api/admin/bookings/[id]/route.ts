export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import { syncRoomToSanity } from '@/utils/santitySync';

import { type RoomStatus } from '@prisma/client';

const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  paidAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  roomId: z.uuid().optional(),
});

// GET /api/admin/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        pg: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
            ownerPhone: true,
            ownerName: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            floor: true,
            monthlyRent: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 },
    );
  }
}

// PUT /api/admin/bookings/[id] - Update booking
const STATUS_ROOM_EFFECTS: Record<
  string,
  { availabilityStatus: RoomStatus; incrementOccupancy?: boolean }
> = {
  CONFIRMED: { availabilityStatus: 'RESERVED' },
  CANCELLED: { availabilityStatus: 'AVAILABLE' },
  COMPLETED: { availabilityStatus: 'OCCUPIED', incrementOccupancy: true },
};

async function applyStatusRoomEffect(status: string, roomId: string | null) {
  const effect = STATUS_ROOM_EFFECTS[status];
  if (!effect || !roomId) return;

  await prisma.room.update({
    where: { id: roomId },
    data: {
      availabilityStatus: effect.availabilityStatus,
      ...(effect.incrementOccupancy && { currentOccupancy: { increment: 1 } }),
    },
  });
}

async function handleRoomReassignment(
  newRoomId: string | undefined,
  existingRoomId: string | null,
) {
  if (!newRoomId || newRoomId === existingRoomId) return;

  if (existingRoomId) {
    await prisma.room.update({
      where: { id: existingRoomId },
      data: { availabilityStatus: 'AVAILABLE' },
    });
  }

  await prisma.room.update({
    where: { id: newRoomId },
    data: { availabilityStatus: 'RESERVED' },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = bookingUpdateSchema.parse(body);

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, roomId: true },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Handle status changes with side effects
    if (validatedData.status) {
      await applyStatusRoomEffect(validatedData.status, existingBooking.roomId);
    }

    // If assigning a room to a booking
    await handleRoomReassignment(validatedData.roomId, existingBooking.roomId);

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        pg: { select: { id: true, name: true, area: true, city: true } },
        room: { select: { id: true, roomNumber: true, roomType: true } },
      },
    });

    // Sync updated room availability to Sanity (fire-and-forget)
    const affectedRoomId = validatedData.roomId ?? existingBooking.roomId;
    if (affectedRoomId && validatedData.status) {
      syncRoomToSanity(affectedRoomId, 'update').catch(console.error);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/bookings/[id] - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: { id: true, roomId: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Release room if assigned
    if (booking.roomId) {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { availabilityStatus: 'AVAILABLE' },
      });
    }

    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 },
    );
  }
}

