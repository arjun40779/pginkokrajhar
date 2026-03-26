export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';

const tenantUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().min(1, 'Emergency contact name is required'),
      relation: z.string().min(1, 'Relation is required'),
      phone: z.string().min(10, 'Emergency contact phone is required'),
    })
    .optional()
    .nullable(),

  // Tenancy Details
  moveInDate: z.string().datetime('Invalid move-in date').optional(),
  moveOutDate: z.string().datetime().optional().nullable(),
  rentAmount: z.number().positive('Rent amount must be positive').optional(),
  rentStatus: z.enum(['PAID', 'PENDING', 'OVERDUE']).optional(),
  roomId: z.string().min(1, 'Room is required').optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/tenants/[id] - Get tenant details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            role: true,
            createdAt: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            floor: true,
            monthlyRent: true,
            securityDeposit: true,
            availabilityStatus: true,
            pg: {
              select: {
                id: true,
                name: true,
                area: true,
                city: true,
                state: true,
                ownerName: true,
                ownerPhone: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            amount: true,
            status: true,
            paymentDate: true,
            dueDate: true,
            month: true,
            notes: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 },
    );
  }
}

// PUT /api/admin/tenants/[id] - Update tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = tenantUpdateSchema.parse(body);

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // If phone is being updated, check for conflicts
    if (validatedData.phone && validatedData.phone !== existingTenant.phone) {
      const phoneConflict = await prisma.tenant.findFirst({
        where: {
          phone: validatedData.phone,
          isActive: true,
          id: { not: params.id },
        },
      });

      if (phoneConflict) {
        return NextResponse.json(
          { error: 'Phone number is already in use by another active tenant' },
          { status: 400 },
        );
      }
    }

    // If room is being changed, check capacity
    if (
      validatedData.roomId &&
      validatedData.roomId !== existingTenant.roomId
    ) {
      const newRoom = await prisma.room.findUnique({
        where: { id: validatedData.roomId },
        include: {
          tenants: { where: { isActive: true } },
        },
      });

      if (!newRoom) {
        return NextResponse.json(
          { error: 'New room not found' },
          { status: 404 },
        );
      }

      if (newRoom.tenants.length >= newRoom.maxOccupancy) {
        return NextResponse.json(
          { error: 'New room is at maximum capacity' },
          { status: 400 },
        );
      }
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.phone && { phone: validatedData.phone }),
        ...(validatedData.email !== undefined && {
          email: validatedData.email || null,
        }),
        ...(validatedData.occupation !== undefined && {
          occupation: validatedData.occupation || null,
        }),
        ...(validatedData.emergencyContact !== undefined && {
          emergencyContact: validatedData.emergencyContact,
        }),
        ...(validatedData.moveInDate && {
          moveInDate: new Date(validatedData.moveInDate),
        }),
        ...(validatedData.moveOutDate !== undefined && {
          moveOutDate: validatedData.moveOutDate
            ? new Date(validatedData.moveOutDate)
            : null,
        }),
        ...(validatedData.rentAmount && {
          rentAmount: validatedData.rentAmount,
        }),
        ...(validatedData.rentStatus && {
          rentStatus: validatedData.rentStatus,
        }),
        ...(validatedData.roomId && { roomId: validatedData.roomId }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
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

    // Update room occupancies if room changed
    if (
      validatedData.roomId &&
      validatedData.roomId !== existingTenant.roomId
    ) {
      // Update old room occupancy
      const oldRoomTenants = await prisma.tenant.count({
        where: {
          roomId: existingTenant.roomId,
          isActive: true,
        },
      });

      await prisma.room.update({
        where: { id: existingTenant.roomId },
        data: {
          currentOccupancy: oldRoomTenants,
          availabilityStatus:
            oldRoomTenants === 0
              ? 'AVAILABLE'
              : existingTenant.room.availabilityStatus,
        },
      });

      // Update new room occupancy
      const newRoomTenants = await prisma.tenant.count({
        where: {
          roomId: validatedData.roomId,
          isActive: true,
        },
      });

      const newRoom = await prisma.room.findUnique({
        where: { id: validatedData.roomId },
      });

      await prisma.room.update({
        where: { id: validatedData.roomId },
        data: {
          currentOccupancy: newRoomTenants,
          availabilityStatus:
            newRoomTenants >= newRoom!.maxOccupancy ? 'OCCUPIED' : 'AVAILABLE',
        },
      });
    }

    // Update user if phone/name/email changed
    if (
      existingTenant.userId &&
      (validatedData.phone ||
        validatedData.name ||
        validatedData.email !== undefined)
    ) {
      await prisma.user.update({
        where: { id: existingTenant.userId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.phone && { mobile: validatedData.phone }),
          ...(validatedData.email !== undefined && {
            email: validatedData.email || null,
          }),
        },
      });
    }

    return NextResponse.json(updatedTenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/tenants/[id] - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
        room: true,
      },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if tenant has payments - if so, just deactivate instead of delete
    if (existingTenant.payments.length > 0) {
      // Soft delete by deactivating
      const updatedTenant = await prisma.tenant.update({
        where: { id: params.id },
        data: {
          isActive: false,
          moveOutDate: new Date(),
        },
      });

      // Update room occupancy
      const roomTenants = await prisma.tenant.count({
        where: {
          roomId: existingTenant.roomId,
          isActive: true,
        },
      });

      await prisma.room.update({
        where: { id: existingTenant.roomId },
        data: {
          currentOccupancy: roomTenants,
          availabilityStatus:
            roomTenants === 0
              ? 'AVAILABLE'
              : existingTenant.room.availabilityStatus,
        },
      });

      return NextResponse.json({
        message: 'Tenant deactivated successfully (has payment history)',
        tenant: updatedTenant,
      });
    } else {
      // Hard delete if no payments
      await prisma.tenant.delete({
        where: { id: params.id },
      });

      // Update room occupancy
      const roomTenants = await prisma.tenant.count({
        where: {
          roomId: existingTenant.roomId,
          isActive: true,
        },
      });

      await prisma.room.update({
        where: { id: existingTenant.roomId },
        data: {
          currentOccupancy: roomTenants,
          availabilityStatus:
            roomTenants === 0
              ? 'AVAILABLE'
              : existingTenant.room.availabilityStatus,
        },
      });

      return NextResponse.json({ message: 'Tenant deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 },
    );
  }
}

