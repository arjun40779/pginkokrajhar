export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncPGToSanity } from '@/utils/santitySync';
import { prisma } from '@/prisma';

const pgCreateSchema = z.object({
  name: z.string().min(1, 'PG name is required'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  area: z.string().min(1, 'Area is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerPhone: z.string().min(10, 'Phone number is required'),
  ownerEmail: z.union([z.email(), z.literal('')]).optional(),
  alternatePhone: z.string().optional(),
  startingPrice: z.number().positive('Starting price must be positive'),
  securityDeposit: z.number().min(0, 'Security deposit cannot be negative'),
  brokerageCharges: z
    .number()
    .min(0, 'Brokerage charges cannot be negative')
    .optional(),
});

// GET /api/admin/pgs - List all PGs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // active, inactive
    const skip = (page - 1) * limit;

    // By default, list PGs that are not archived
    const where: any = { status: { not: 'ARCHIVED' } };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') where.status = 'ACTIVE';
    if (status === 'inactive') where.status = 'INACTIVE';
    const [pgs, total] = await Promise.all([
      prisma.pG.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          rooms: {
            select: {
              availabilityStatus: true,
            },
          },
          _count: {
            select: {
              rooms: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.pG.count({ where }),
    ]);

    const normalizedPGs = pgs.map((pg) => {
      const totalRooms = pg.rooms.length;
      const availableRooms = pg.rooms.filter(
        (room) => room.availabilityStatus === 'AVAILABLE',
      ).length;

      return {
        ...pg,
        totalRooms,
        availableRooms,
      };
    });

    return NextResponse.json({
      pgs: normalizedPGs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching PGs:', error);
    return NextResponse.json({ error: 'Failed to fetch PGs' }, { status: 500 });
  }
}

// POST /api/admin/pgs - Create new PG
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = pgCreateSchema.parse(body);

    const generateSlug = (name: string) =>
      name
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/(^-|-$)/g, '');

    const slug = generateSlug(validatedData.name);

    // Check if slug already exists
    const existingPG = await prisma.pG.findUnique({
      where: { slug },
    });

    if (existingPG) {
      return NextResponse.json(
        { error: 'PG with a similar name already exists' },
        { status: 400 },
      );
    }

    const defaultTotalRooms = 0;

    const pg = await prisma.pG.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        isActive: true,
        status: 'ACTIVE',
        address: validatedData.address,
        area: validatedData.area,
        city: validatedData.city,
        state: validatedData.state,
        pincode: validatedData.pincode,
        ownerName: validatedData.ownerName,
        ownerPhone: validatedData.ownerPhone,
        ownerEmail: validatedData.ownerEmail || null,
        alternatePhone: validatedData.alternatePhone || null,
        startingPrice: validatedData.startingPrice,
        securityDeposit: validatedData.securityDeposit,
        brokerageCharges: validatedData.brokerageCharges || 0,
        totalRooms: defaultTotalRooms,
        availableRooms: defaultTotalRooms,
      },
    });

    // Sync to Sanity (non-blocking)
    syncPGToSanity(pg.id, 'create').catch((error) => {
      console.error('Failed to sync PG to Sanity:', error);
    });

    return NextResponse.json(pg, { status: 201 });
  } catch (error) {
    console.error('Error creating PG:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to create PG' }, { status: 500 });
  }
}

