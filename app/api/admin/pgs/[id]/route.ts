import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncPGToSanity } from '@/utils/santitySync';

const prisma = new PrismaClient();

const pgUpdateSchema = z.object({
  name: z.string().min(1, 'PG name is required').optional(),
  description: z.string().optional(),

  // Location
  address: z.string().min(1, 'Address is required').optional(),
  area: z.string().min(1, 'Area is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be 6 digits')
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Contact
  ownerName: z.string().min(1, 'Owner name is required').optional(),
  ownerPhone: z.string().min(10, 'Phone number is required').optional(),
  ownerEmail: z.string().email().optional().or(z.literal('')),
  alternatePhone: z.string().optional(),

  // Rules
  genderRestriction: z.enum(['BOYS', 'GIRLS', 'COED']).optional(),
  gateClosingTime: z.string().optional(),
  smokingAllowed: z.boolean().optional(),
  drinkingAllowed: z.boolean().optional(),

  // Pricing
  startingPrice: z
    .number()
    .positive('Starting price must be positive')
    .optional(),
  securityDeposit: z
    .number()
    .positive('Security deposit must be positive')
    .optional(),
  brokerageCharges: z.number().optional(),

  // Utilities
  electricityIncluded: z.boolean().optional(),
  waterIncluded: z.boolean().optional(),
  wifiIncluded: z.boolean().optional(),

  // Meta
  totalRooms: z
    .number()
    .int()
    .positive('Total rooms must be positive')
    .optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
});

// GET /api/admin/pgs/[id] - Get PG details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const pg = await prisma.pG.findUnique({
      where: { id: params.id },
      include: {
        rooms: {
          include: {
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
              select: { tenants: { where: { isActive: true } } },
            },
          },
          orderBy: { roomNumber: 'asc' },
        },
        bookings: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        inquiries: {
          where: { status: 'NEW' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            rooms: true,
            bookings: true,
            inquiries: true,
          },
        },
      },
    });

    if (!pg) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    return NextResponse.json(pg);
  } catch (error) {
    console.error('Error fetching PG:', error);
    return NextResponse.json({ error: 'Failed to fetch PG' }, { status: 500 });
  }
}

// PUT /api/admin/pgs/[id] - Update PG
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = pgUpdateSchema.parse(body);

    // Check if PG exists
    const existingPG = await prisma.pG.findUnique({
      where: { id: params.id },
    });

    if (!existingPG) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    // Update available rooms if total rooms changed
    let availableRoomsUpdate = {};
    if (
      validatedData.totalRooms &&
      validatedData.totalRooms !== existingPG.totalRooms
    ) {
      const occupiedRooms = existingPG.totalRooms - existingPG.availableRooms;
      availableRoomsUpdate = {
        availableRooms: Math.max(0, validatedData.totalRooms - occupiedRooms),
      };
    }

    const updatedPG = await prisma.pG.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...availableRoomsUpdate,
        ownerEmail: validatedData.ownerEmail || null,
      },
      include: {
        _count: {
          select: {
            rooms: true,
            bookings: true,
          },
        },
      },
    });

    // Sync to Sanity (non-blocking)
    syncPGToSanity(params.id, 'update').catch((error) => {
      console.error('Failed to sync PG update to Sanity:', error);
    });

    return NextResponse.json(updatedPG);
  } catch (error) {
    console.error('Error updating PG:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to update PG' }, { status: 500 });
  }
}

// DELETE /api/admin/pgs/[id] - Delete PG (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if PG exists
    const existingPG = await prisma.pG.findUnique({
      where: { id: params.id },
      include: {
        rooms: {
          include: {
            tenants: { where: { isActive: true } },
          },
        },
      },
    });

    if (!existingPG) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    // Check if PG has active tenants
    const activeTenants = existingPG.rooms.some(
      (room) => room.tenants.length > 0,
    );
    if (activeTenants) {
      return NextResponse.json(
        {
          error:
            'Cannot delete PG with active tenants. Please move tenants first.',
        },
        { status: 400 },
      );
    }

    // Soft delete - just mark as inactive
    const deletedPG = await prisma.pG.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    // TODO: Trigger webhook to update/unpublish Sanity document

    return NextResponse.json({
      message: 'PG deleted successfully',
      pg: deletedPG,
    });
  } catch (error) {
    console.error('Error deleting PG:', error);
    return NextResponse.json({ error: 'Failed to delete PG' }, { status: 500 });
  }
}

