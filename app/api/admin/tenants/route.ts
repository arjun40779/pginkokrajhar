import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1, 'Emergency contact name is required'),
      relation: z.string().min(1, 'Relation is required'),
      phone: z.string().min(10, 'Emergency contact phone is required'),
    })
    .optional(),

  // Tenancy Details
  moveInDate: z.string().datetime('Invalid move-in date'),
  moveOutDate: z.string().datetime().optional().nullable(),
  rentAmount: z.number().positive('Rent amount must be positive'),
  rentStatus: z.enum(['PAID', 'PENDING', 'OVERDUE']).default('PENDING'),
  roomId: z.string().min(1, 'Room is required'),
  isActive: z.boolean().default(true),

  // User details for creating linked user account
  createUser: z.boolean().default(true),
});

// GET /api/admin/tenants - List all tenants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') ?? '1');
    const limit = Number.parseInt(searchParams.get('limit') ?? '20');
    const search = searchParams.get('search') ?? '';
    const roomId = searchParams.get('roomId') ?? '';
    const pgId = searchParams.get('pgId') ?? '';
    const status = searchParams.get('status') ?? '';
    const rentStatus = searchParams.get('rentStatus') ?? '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (pgId) {
      where.room = {
        pgId: pgId,
      };
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (rentStatus) {
      where.rentStatus = rentStatus.toUpperCase();
    }

    const [tenants, totalCount] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              pg: {
                select: {
                  id: true,
                  name: true,
                  area: true,
                  city: true,
                },
              },
            },
          },
          payments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              month: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      tenants,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 },
    );
  }
}

// POST /api/admin/tenants - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = tenantSchema.parse(body);

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
      include: {
        tenants: { where: { isActive: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check room capacity
    if (room.tenants.length >= room.maxOccupancy) {
      return NextResponse.json(
        { error: 'Room is at maximum capacity' },
        { status: 400 },
      );
    }

    // Check if phone number is already in use
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        phone: validatedData.phone,
        isActive: true,
      },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Phone number is already in use by another active tenant' },
        { status: 400 },
      );
    }

    // Create or find user
    let user = null;
    if (validatedData.createUser) {
      // Check if user already exists with this phone
      user = await prisma.user.findUnique({
        where: { mobile: validatedData.phone },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: validatedData.name,
            mobile: validatedData.phone,
            email: validatedData.email ?? null,
            role: 'TENANT',
          },
        });
      }
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email ?? null,
        occupation: validatedData.occupation ?? null,
        emergencyContact: validatedData.emergencyContact ?? '',
        moveInDate: new Date(validatedData.moveInDate),
        moveOutDate: validatedData.moveOutDate
          ? new Date(validatedData.moveOutDate)
          : null,
        rentAmount: validatedData.rentAmount,
        rentStatus: validatedData.rentStatus,
        roomId: validatedData.roomId,
        userId: user?.id || '',
        isActive: validatedData.isActive,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            pg: {
              select: {
                id: true,
                name: true,
                area: true,
                city: true,
              },
            },
          },
        },
      },
    });

    // Update room occupancy
    await prisma.room.update({
      where: { id: validatedData.roomId },
      data: {
        currentOccupancy: room.tenants.length + 1,
        availabilityStatus:
          room.tenants.length + 1 >= room.maxOccupancy
            ? 'OCCUPIED'
            : room.availabilityStatus,
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 },
      );
    }

    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 },
    );
  }
}

