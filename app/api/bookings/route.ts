export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import {
  formatRoomAvailabilityLabel,
  isRoomAvailableForBooking,
} from '@/lib/rooms/availability';

const bookingCreateSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  customerEmail: z.email().optional().or(z.literal('')),
  pgId: z.uuid('Valid PG ID is required').optional(),
  roomId: z.uuid('Valid Room ID is required').optional(),
  checkInDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: 'Valid check-in date is required',
  }),
  checkOutDate: z
    .string()
    .optional()
    .refine((date) => !date || !Number.isNaN(Date.parse(date)), {
      message: 'Valid check-out date required if provided',
    }),
  notes: z.string().optional(),
});

async function resolveBookingRoomDetails(roomId: string | undefined) {
  if (!roomId) {
    return { roomDetails: null, pgId: undefined };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      roomNumber: true,
      roomType: true,
      monthlyRent: true,
      securityDeposit: true,
      availabilityStatus: true,
      currentOccupancy: true,
      maxOccupancy: true,
      pgId: true,
      pg: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!room) {
    return {
      error: NextResponse.json({ error: 'Room not found' }, { status: 404 }),
    };
  }

  if (
    !isRoomAvailableForBooking(
      room.availabilityStatus,
      room.currentOccupancy,
      room.maxOccupancy,
    )
  ) {
    return {
      error: NextResponse.json(
        {
          error: `Room is currently ${formatRoomAvailabilityLabel(
            room.availabilityStatus,
            room.currentOccupancy,
            room.maxOccupancy,
          ).toLowerCase()}`,
        },
        { status: 400 },
      ),
    };
  }

  return { roomDetails: room, pgId: room.pgId };
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingCreateSchema.parse(body);

    const bookingRoom = await resolveBookingRoomDetails(validatedData.roomId);
    if ('error' in bookingRoom) {
      return bookingRoom.error;
    }

    const roomDetails = bookingRoom.roomDetails;
    const pgId = bookingRoom.pgId ?? validatedData.pgId;

    // Validate PG exists
    if (!pgId) {
      return NextResponse.json(
        { error: 'Either PG ID or Room ID must be provided' },
        { status: 400 },
      );
    }

    const pg = await prisma.pG.findUnique({
      where: { id: pgId },
      select: {
        id: true,
        name: true,
        startingPrice: true,
        isActive: true,
      },
    });

    if (!pg?.isActive) {
      return NextResponse.json(
        { error: 'PG not found or inactive' },
        { status: 404 },
      );
    }

    // Calculate pricing
    const monthlyRent = roomDetails
      ? roomDetails.monthlyRent
      : pg.startingPrice;
    const securityDeposit = roomDetails ? roomDetails.securityDeposit : 0;
    const totalAmount = Number(monthlyRent) + Number(securityDeposit);
    const bookingNotes = validatedData.notes?.trim() || null;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail || null,
        pgId: pgId,
        roomId: validatedData.roomId || null,
        checkInDate: new Date(validatedData.checkInDate),
        checkOutDate: validatedData.checkOutDate
          ? new Date(validatedData.checkOutDate)
          : null,
        monthlyRent: Number(monthlyRent),
        securityDeposit: Number(securityDeposit),
        totalAmount: totalAmount,
        paidAmount: 0,
        status: 'PENDING',
        notes: bookingNotes,
      },
    });

    if (validatedData.roomId) {
      await prisma.room.update({
        where: { id: validatedData.roomId },
        data: { availabilityStatus: 'RESERVED' },
      });
    }

    // Return booking with details
    const bookingWithDetails = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        pg: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
            ownerPhone: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            floor: true,
          },
        },
      },
    });

    return NextResponse.json(bookingWithDetails, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 },
    );
  }
}

// GET /api/bookings - Get booking by ID or phone (for public queries)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    const phone = searchParams.get('phone');

    if (!bookingId && !phone) {
      return NextResponse.json(
        { error: 'Either booking ID or phone number is required' },
        { status: 400 },
      );
    }

    let where: any = {};
    if (bookingId) {
      where.id = bookingId;
    } else if (phone) {
      where.customerPhone = phone;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        pg: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
            ownerPhone: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            floor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (bookingId) {
      return NextResponse.json(bookings[0] || null);
    } else {
      return NextResponse.json(bookings);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 },
    );
  }
}

