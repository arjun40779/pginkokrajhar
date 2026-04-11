export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncPGToSanity } from '@/utils/santitySync';
import { prisma } from '@/prisma';

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

  // Contact
  ownerName: z.string().min(1, 'Owner name is required').optional(),
  ownerPhone: z.string().min(10, 'Phone number is required').optional(),
  ownerEmail: z.union([z.email(), z.literal('')]).optional(),
  alternatePhone: z.string().optional(),

  // Pricing
  startingPrice: z
    .number()
    .positive('Starting price must be positive')
    .optional(),
  isActive: z.boolean().optional(),
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  razorpayAccountId: z.string().optional(),
});

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');

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

    const totalRooms = pg.rooms.length;
    const availableRooms = pg.rooms.filter(
      (room) => room.availabilityStatus === 'AVAILABLE',
    ).length;

    return NextResponse.json({
      ...pg,
      totalRooms,
      availableRooms,
    });
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

    const updateData: any = {
      ...validatedData,
      ownerEmail: validatedData.ownerEmail || null,
      razorpayKeyId: validatedData.razorpayKeyId ?? existingPG.razorpayKeyId,
      razorpayKeySecret:
        validatedData.razorpayKeySecret ?? existingPG.razorpayKeySecret,
      razorpayAccountId:
        validatedData.razorpayAccountId ?? existingPG.razorpayAccountId,
    };

    // Ensure slug always tracks the current name, even for older records
    const effectiveName = validatedData.name ?? existingPG.name;
    const normalizedSlug = generateSlug(effectiveName);

    if (normalizedSlug && normalizedSlug !== existingPG.slug) {
      const slugConflict = await prisma.pG.findUnique({
        where: { slug: normalizedSlug },
      });

      if (slugConflict && slugConflict.id !== existingPG.id) {
        return NextResponse.json(
          { error: 'Another PG already uses this generated slug' },
          { status: 400 },
        );
      }

      updateData.slug = normalizedSlug;
    }

    // Keep PG status in sync with isActive when toggled from admin panel
    if (validatedData.isActive !== undefined) {
      updateData.status = validatedData.isActive ? 'ACTIVE' : 'INACTIVE';
    }

    const updatedPG = await prisma.pG.update({
      where: { id: params.id },
      data: updateData,
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
        { error: 'Validation failed', details: error.message },
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

    const hasRooms = existingPG.rooms.length > 0;
    const hasActiveTenants = existingPG.rooms.some(
      (room) => room.tenants.length > 0,
    );

    // Soft delete - mark as archived/inactive
    const deletedPG = await prisma.pG.update({
      where: { id: params.id },
      data: { isActive: false, status: 'ARCHIVED' },
    });

    // Sync soft-delete state to Sanity (non-blocking)
    syncPGToSanity(params.id, 'update').catch((error) => {
      console.error('Failed to sync PG delete to Sanity:', error);
    });

    let message = 'PG archived successfully';
    if (hasActiveTenants) {
      message = 'PG archived instead of deleted because it has active tenants.';
    } else if (hasRooms) {
      message = 'PG archived instead of deleted because it still has rooms.';
    }

    return NextResponse.json({
      message,
      pg: deletedPG,
      archived: true,
    });
  } catch (error) {
    console.error('Error deleting PG:', error);
    return NextResponse.json({ error: 'Failed to delete PG' }, { status: 500 });
  }
}

