export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncRoomToSanity } from '@/utils/santitySync';
import { prisma } from '@/prisma';

const roomUpdateSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required').optional(),
  description: z.string().optional(),

  // Room Details
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY']).optional(),
  maxOccupancy: z
    .number()
    .int()
    .positive('Max occupancy must be positive')
    .optional(),
  floor: z.number().int('Floor must be a number').optional(),
  roomSize: z.number().positive().optional(),

  // Features
  hasBalcony: z.boolean().optional(),
  hasAttachedBath: z.boolean().optional(),
  hasAC: z.boolean().optional(),
  hasFan: z.boolean().optional(),
  windowDirection: z
    .enum([
      'NORTH',
      'SOUTH',
      'EAST',
      'WEST',
      'NORTHEAST',
      'NORTHWEST',
      'SOUTHEAST',
      'SOUTHWEST',
    ])
    .optional(),

  // Pricing
  monthlyRent: z.number().positive('Monthly rent must be positive').optional(),
  securityDeposit: z
    .number()
    .min(0, 'Security deposit cannot be negative')
    .optional(),
  maintenanceCharges: z.number().optional(),
  electricityIncluded: z.boolean().optional(),

  // Availability
  availabilityStatus: z
    .enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'])
    .optional(),
  availableFrom: z.string().datetime().optional(),

  // Meta
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
});

// GET /api/admin/rooms/[id] - Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        pg: true,
        tenants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                mobile: true,
                email: true,
              },
            },
          },
          orderBy: { moveInDate: 'desc' },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            tenants: { where: { isActive: true } },
            bookings: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 },
    );
  }
}

// PUT /api/admin/rooms/[id] - Update room
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = roomUpdateSchema.parse(body);

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: params.id },
      include: { pg: true },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check room number uniqueness if it's being updated
    if (
      validatedData.roomNumber &&
      validatedData.roomNumber !== existingRoom.roomNumber
    ) {
      const roomWithSameNumber = await prisma.room.findUnique({
        where: {
          pgId_roomNumber: {
            pgId: existingRoom.pgId,
            roomNumber: validatedData.roomNumber,
          },
        },
      });

      if (roomWithSameNumber) {
        return NextResponse.json(
          { error: 'Room number already exists in this PG' },
          { status: 400 },
        );
      }
    }

    // Handle availability status changes
    let pgAvailabilityUpdate = {};
    if (
      validatedData.availabilityStatus &&
      validatedData.availabilityStatus !== existingRoom.availabilityStatus
    ) {
      const oldStatus = existingRoom.availabilityStatus;
      const newStatus = validatedData.availabilityStatus;

      // Update PG available rooms count
      if (
        (oldStatus === 'OCCUPIED' ||
          oldStatus === 'MAINTENANCE' ||
          oldStatus === 'RESERVED') &&
        newStatus === 'AVAILABLE'
      ) {
        // Room becomes available
        pgAvailabilityUpdate = { availableRooms: { increment: 1 } };
      } else if (
        oldStatus === 'AVAILABLE' &&
        (newStatus === 'OCCUPIED' ||
          newStatus === 'MAINTENANCE' ||
          newStatus === 'RESERVED')
      ) {
        // Room becomes unavailable
        pgAvailabilityUpdate = { availableRooms: { decrement: 1 } };
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        availableFrom: validatedData.availableFrom
          ? new Date(validatedData.availableFrom)
          : undefined,
      },
      include: {
        pg: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
          },
        },
        _count: {
          select: {
            tenants: { where: { isActive: true } },
            bookings: true,
          },
        },
      },
    });

    // Update PG availability if needed
    if (Object.keys(pgAvailabilityUpdate).length > 0) {
      await prisma.pG.update({
        where: { id: existingRoom.pgId },
        data: pgAvailabilityUpdate,
      });
    }

    // Sync to Sanity (non-blocking)
    syncRoomToSanity(params.id, 'update').catch((error) => {
      console.error('Failed to sync Room update to Sanity:', error);
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/rooms/[id] - Delete room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        tenants: { where: { isActive: true } },
      },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if room has active tenants
    if (existingRoom.tenants.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete room with active tenants. Please move tenants first.',
        },
        { status: 400 },
      );
    }

    // Delete room (hard delete since it's a room, not sensitive data)
    await prisma.room.delete({
      where: { id: params.id },
    });

    // Update PG available rooms count (decrease total rooms)
    await prisma.pG.update({
      where: { id: existingRoom.pgId },
      data: {
        totalRooms: { decrement: 1 },
        availableRooms:
          existingRoom.availabilityStatus === 'AVAILABLE'
            ? { decrement: 1 }
            : undefined,
      },
    });

    // TODO: Trigger webhook to delete/unpublish Sanity document

    return NextResponse.json({
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 },
    );
  }
}

