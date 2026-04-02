export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncRoomToSanity } from '@/utils/santitySync';
import { prisma } from '@/prisma';
import { buildRoomSlug } from '@/lib/rooms/slug';
import { normalizeMaxOccupancy } from '@/lib/rooms/occupancy';

const isValidDateTime = (value: string) => !Number.isNaN(Date.parse(value));
const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const roomCreateSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  description: z.string().optional(),
  pgId: z.string().refine(isValidUuid, 'Valid PG ID is required'),

  // Room Details
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY']),
  maxOccupancy: z.number().int().positive('Max occupancy must be positive'),
  floor: z.number().int('Floor must be a number'),
  roomSize: z.number().positive().optional(),

  // Features
  hasBalcony: z.boolean().default(false),
  hasAttachedBath: z.boolean().default(false),
  hasAC: z.boolean().default(false),
  hasFan: z.boolean().default(true),

  // Pricing
  monthlyRent: z.number().positive('Monthly rent must be positive'),
  securityDeposit: z.number().min(0, 'Security deposit cannot be negative'),
  maintenanceCharges: z.number().default(0),
  electricityIncluded: z.boolean().default(true),

  availableFrom: z
    .string()
    .refine(isValidDateTime, 'Valid availability date is required')
    .optional(),
});

async function createUniqueRoomSlug(
  pgSlugOrName: string,
  roomNumber: string,
): Promise<string> {
  const baseSlug = buildRoomSlug(pgSlugOrName, roomNumber);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingRoom = await prisma.room.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingRoom) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

// GET /api/admin/rooms - List all rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const pgId = searchParams.get('pgId');
    const status = searchParams.get('status'); // available, occupied, maintenance, reserved
    const roomType = searchParams.get('roomType');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { pg: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (pgId) where.pgId = pgId;
    if (status) where.availabilityStatus = status.toUpperCase();
    if (roomType) where.roomType = roomType.toUpperCase();

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ pg: { name: 'asc' } }, { roomNumber: 'asc' }],
        include: {
          pg: {
            select: {
              id: true,
              name: true,
              area: true,
              city: true,
            },
          },
          tenants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              phone: true,
              moveInDate: true,
            },
          },
          _count: {
            select: {
              tenants: { where: { isActive: true } },
              bookings: { where: { status: 'PENDING' } },
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      rooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 },
    );
  }
}

// POST /api/admin/rooms - Create new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = roomCreateSchema.parse(body);
    const normalizedMaxOccupancy = normalizeMaxOccupancy(
      validatedData.roomType,
      validatedData.maxOccupancy,
    );

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: validatedData.pgId },
    });

    if (!pg) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    // Check if room number already exists in this PG
    const existingRoom = await prisma.room.findUnique({
      where: {
        pgId_roomNumber: {
          pgId: validatedData.pgId,
          roomNumber: validatedData.roomNumber,
        },
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room number already exists in this PG' },
        { status: 400 },
      );
    }

    const slug = await createUniqueRoomSlug(
      pg.slug || pg.name,
      validatedData.roomNumber,
    );

    // Create room
    const room = await prisma.room.create({
      data: {
        ...validatedData,
        maxOccupancy: normalizedMaxOccupancy,
        slug,
        availableFrom: validatedData.availableFrom
          ? new Date(validatedData.availableFrom)
          : null,
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
      },
    });

    // Update PG available rooms count
    await prisma.pG.update({
      where: { id: validatedData.pgId },
      data: { availableRooms: { increment: 1 } },
    });

    // Sync to Sanity (non-blocking)
    syncRoomToSanity(room.id, 'create').catch((error) => {
      console.error('Failed to sync Room to Sanity:', error);
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 },
    );
  }
}

