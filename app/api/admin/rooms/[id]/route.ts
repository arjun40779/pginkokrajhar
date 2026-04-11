export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncRoomToSanity } from '@/utils/santitySync';
import { prisma } from '@/prisma';
import { buildRoomSlug } from '@/lib/rooms/slug';
import { normalizeMaxOccupancy } from '@/lib/rooms/occupancy';

const isValidDateTime = (value: string) => !Number.isNaN(Date.parse(value));

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

  // roomSize has been removed as it is no longer needed

  // Features
  hasBalcony: z.boolean().optional(),
  hasAttachedBath: z.boolean().optional(),
  hasAC: z.boolean().optional(),
  hasFan: z.boolean().optional(),

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
  availableFrom: z
    .string()
    .refine(isValidDateTime, 'Valid availability date is required')
    .optional(),

  // Meta
  isActive: z.boolean().optional(),
});

async function findRoomByIdentifier(identifier: string) {
  return prisma.room.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
  });
}

async function createUniqueRoomSlug(
  pgSlugOrName: string,
  roomNumber: string,
  excludeRoomId?: string,
): Promise<string> {
  const baseSlug = buildRoomSlug(pgSlugOrName, roomNumber);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingRoom = await prisma.room.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingRoom || existingRoom.id === excludeRoomId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getExistingRoom(identifier: string) {
  const matchedRoom = await findRoomByIdentifier(identifier);

  if (!matchedRoom) {
    return null;
  }

  return prisma.room.findUnique({
    where: { id: matchedRoom.id },
    include: { pg: true },
  });
}

function getPgAvailabilityUpdate(
  oldStatus: string,
  newStatus?: string,
): Record<string, { increment?: number; decrement?: number }> {
  if (!newStatus || newStatus === oldStatus) {
    return {};
  }

  if (
    (oldStatus === 'OCCUPIED' ||
      oldStatus === 'MAINTENANCE' ||
      oldStatus === 'RESERVED') &&
    newStatus === 'AVAILABLE'
  ) {
    return { availableRooms: { increment: 1 } };
  }

  if (
    oldStatus === 'AVAILABLE' &&
    (newStatus === 'OCCUPIED' ||
      newStatus === 'MAINTENANCE' ||
      newStatus === 'RESERVED')
  ) {
    return { availableRooms: { decrement: 1 } };
  }

  return {};
}

// GET /api/admin/rooms/[id] - Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const matchedRoom = await findRoomByIdentifier(params.id);

    const room = matchedRoom
      ? await prisma.room.findUnique({
          where: { id: matchedRoom.id },
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
        })
      : null;

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
    const existingRoom = await getExistingRoom(params.id);

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

    const nextRoomNumber = validatedData.roomNumber ?? existingRoom.roomNumber;
    const slug = await createUniqueRoomSlug(
      existingRoom.pg.slug || existingRoom.pg.name,
      nextRoomNumber,
      existingRoom.id,
    );

    const pgAvailabilityUpdate = getPgAvailabilityUpdate(
      existingRoom.availabilityStatus,
      validatedData.availabilityStatus,
    );
    const nextRoomType = validatedData.roomType ?? existingRoom.roomType;
    const nextMaxOccupancy =
      validatedData.maxOccupancy ?? existingRoom.maxOccupancy;
    const normalizedMaxOccupancy = normalizeMaxOccupancy(
      nextRoomType,
      nextMaxOccupancy,
    );

    const updatedRoom = await prisma.room.update({
      where: { id: existingRoom.id },
      data: {
        ...validatedData,
        maxOccupancy: normalizedMaxOccupancy,
        slug,
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
    syncRoomToSanity(existingRoom.id, 'update').catch((error) => {
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
    const existingRoomMatch = await findRoomByIdentifier(params.id);

    const existingRoom = existingRoomMatch
      ? await prisma.room.findUnique({
          where: { id: existingRoomMatch.id },
          include: {
            tenants: { where: { isActive: true } },
          },
        })
      : null;

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const hasActiveTenants = existingRoom.tenants.length > 0;

    // Check if room has any bookings (past or present)
    const roomBookingsCount = await prisma.booking.count({
      where: { roomId: existingRoom.id },
    });
    const hasBookings = roomBookingsCount > 0;

    // If the room cannot be safely hard-deleted, archive it instead of erroring
    if (hasActiveTenants || hasBookings) {
      const archivedRoom = await prisma.room.update({
        where: { id: existingRoom.id },
        data: {
          isActive: false,
        },
      });

      const reasonParts: string[] = [];
      if (hasActiveTenants) {
        reasonParts.push('active tenants');
      }
      if (hasBookings) {
        reasonParts.push('existing bookings');
      }

      const reason = reasonParts.join(' and ');

      return NextResponse.json({
        message: `Room archived instead of deleted because it has ${reason}.`,
        room: archivedRoom,
        archived: true,
      });
    }

    // Sync delete to Sanity (non-blocking, before DB delete so data is available)
    syncRoomToSanity(existingRoom.id, 'delete').catch((error) => {
      console.error('Failed to sync Room delete to Sanity:', error);
    });

    // Delete room (hard delete since it's a room, not sensitive data)
    await prisma.room.delete({
      where: { id: existingRoom.id },
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

