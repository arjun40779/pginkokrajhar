import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncPGToSanity } from '@/utils/santitySync';
import { prisma } from '@/prisma';

const pgCreateSchema = z.object({
  name: z.string().min(1, 'PG name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),

  // Location
  address: z.string().min(1, 'Address is required'),
  area: z.string().min(1, 'Area is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Contact
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerPhone: z.string().min(10, 'Phone number is required'),
  ownerEmail: z.string().email().optional().or(z.literal('')),
  alternatePhone: z.string().optional(),

  // Rules
  genderRestriction: z.enum(['BOYS', 'GIRLS', 'COED']).default('COED'),
  gateClosingTime: z.string().optional(),
  smokingAllowed: z.boolean().default(false),
  drinkingAllowed: z.boolean().default(false),

  // Pricing
  startingPrice: z.number().positive('Starting price must be positive'),
  securityDeposit: z.number().positive('Security deposit must be positive'),
  brokerageCharges: z.number().default(0),

  // Utilities
  electricityIncluded: z.boolean().default(true),
  waterIncluded: z.boolean().default(true),
  wifiIncluded: z.boolean().default(true),

  // Meta
  totalRooms: z.number().int().positive('Total rooms must be positive'),
  featured: z.boolean().default(false),
});

// GET /api/admin/pgs - List all PGs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // active, inactive
    const featured = searchParams.get('featured'); // true, false

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (featured === 'true') where.featured = true;
    if (featured === 'false') where.featured = false;

    const [pgs, total] = await Promise.all([
      prisma.pG.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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

    return NextResponse.json({
      pgs,
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

    // Check if slug already exists
    const existingPG = await prisma.pG.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPG) {
      return NextResponse.json(
        { error: 'PG with this slug already exists' },
        { status: 400 },
      );
    }

    // Create PG with available rooms = total rooms initially
    const pg = await prisma.pG.create({
      data: {
        ...validatedData,
        availableRooms: validatedData.totalRooms,
        ownerEmail: validatedData.ownerEmail || null,
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
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to create PG' }, { status: 500 });
  }
}

