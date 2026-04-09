export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/prisma';
import {
  getRazorpayKeySecret,
  isRazorpayConfigured,
  type RazorpayConfig,
} from '@/lib/payments/razorpay';
import { isRoomAvailableForBooking } from '@/lib/rooms/availability';

const verifySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  customerEmail: z.email().optional().or(z.literal('')),
  pgId: z.uuid('Valid PG ID is required'),
  roomId: z.uuid('Valid room ID is required').optional(),
  checkInDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: 'Valid check-in date is required',
  }),
  notes: z.string().optional(),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

type VerifiedPaymentInput = z.infer<typeof verifySchema>;

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  config?: RazorpayConfig,
) {
  const expectedSignature = createHmac('sha256', getRazorpayKeySecret(config))
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}

function formatPaymentMonth(date: Date) {
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

async function findExistingVerifiedBooking(
  tx: Prisma.TransactionClient,
  paymentId: string,
) {
  return tx.booking.findFirst({
    where: {
      notes: {
        contains: `Payment: ${paymentId}`,
      },
    },
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
}

async function ensureTenantAssignment(
  tx: Prisma.TransactionClient,
  input: {
    roomId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    moveInDate: Date;
    monthlyRent: number;
    totalAmount: number;
    paymentId: string;
  },
) {
  const activeTenantForRoom = await tx.tenant.findFirst({
    where: {
      roomId: input.roomId,
      phone: input.customerPhone,
      isActive: true,
    },
    select: {
      id: true,
      roomId: true,
    },
  });

  if (activeTenantForRoom) {
    return {
      tenantId: activeTenantForRoom.id,
      previousRoomId: activeTenantForRoom.roomId,
    };
  }

  let user = await tx.user.findFirst({
    where: {
      isActive: true,
      OR: [
        { mobile: input.customerPhone },
        ...(input.customerEmail ? [{ email: input.customerEmail }] : []),
      ],
    },
    include: {
      tenant: {
        select: {
          id: true,
          roomId: true,
        },
      },
    },
  });

  user ??= await tx.user.create({
    data: {
      name: input.customerName,
      mobile: input.customerPhone,
      email: input.customerEmail || null,
      role: 'TENANT',
    },
    include: {
      tenant: {
        select: {
          id: true,
          roomId: true,
        },
      },
    },
  });

  await tx.user.update({
    where: { id: user.id },
    data: {
      name: input.customerName,
      mobile: input.customerPhone,
      email: input.customerEmail || null,
      role: 'TENANT',
      isActive: true,
    },
  });

  const tenant = user.tenant
    ? await tx.tenant.update({
        where: { id: user.tenant.id },
        data: {
          name: input.customerName,
          phone: input.customerPhone,
          email: input.customerEmail || null,
          moveInDate: input.moveInDate,
          moveOutDate: null,
          rentAmount: input.monthlyRent,
          rentStatus: 'PAID',
          roomId: input.roomId,
          isActive: true,
        },
      })
    : await tx.tenant.create({
        data: {
          name: input.customerName,
          phone: input.customerPhone,
          email: input.customerEmail || null,
          moveInDate: input.moveInDate,
          rentAmount: input.monthlyRent,
          rentStatus: 'PAID',
          roomId: input.roomId,
          userId: user.id,
          isActive: true,
        },
      });

  const paymentMonth = formatPaymentMonth(input.moveInDate);
  const existingPayment = await tx.payment.findFirst({
    where: {
      tenantId: tenant.id,
      month: paymentMonth,
    },
    select: {
      id: true,
    },
  });

  if (existingPayment) {
    await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        amount: input.totalAmount,
        status: 'COMPLETED',
        paymentDate: new Date(),
        dueDate: input.moveInDate,
        notes: `Booking payment via Razorpay (${input.paymentId})`,
      },
    });
  } else {
    await tx.payment.create({
      data: {
        tenantId: tenant.id,
        amount: input.totalAmount,
        status: 'COMPLETED',
        paymentDate: new Date(),
        dueDate: input.moveInDate,
        month: paymentMonth,
        notes: `Booking payment via Razorpay (${input.paymentId})`,
      },
    });
  }

  return {
    tenantId: tenant.id,
    previousRoomId: user.tenant?.roomId ?? null,
  };
}

async function resolveBookingRoom(
  tx: Prisma.TransactionClient,
  pgId: string,
  roomId?: string,
) {
  if (!roomId) {
    return null;
  }

  const room = await tx.room.findFirst({
    where: {
      id: roomId,
      pgId,
      isActive: true,
    },
    select: {
      id: true,
      roomNumber: true,
      roomType: true,
      floor: true,
      availabilityStatus: true,
      currentOccupancy: true,
      maxOccupancy: true,
      monthlyRent: true,
      securityDeposit: true,
      tenants: {
        where: { isActive: true },
        select: {
          id: true,
        },
      },
    },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (
    !isRoomAvailableForBooking(
      room.availabilityStatus,
      room.currentOccupancy,
      room.maxOccupancy,
    )
  ) {
    throw new Error('Room is no longer available for checkout');
  }

  return room;
}

async function syncRoomOccupancy(
  tx: Prisma.TransactionClient,
  roomId: string,
  fallbackMaxOccupancy?: number,
) {
  const activeTenantCount = await tx.tenant.count({
    where: {
      roomId,
      isActive: true,
    },
  });

  const room = await tx.room.findUnique({
    where: { id: roomId },
    select: {
      maxOccupancy: true,
    },
  });

  const maxOccupancy = room?.maxOccupancy ?? fallbackMaxOccupancy ?? 1;

  await tx.room.update({
    where: { id: roomId },
    data: {
      currentOccupancy: activeTenantCount,
      availabilityStatus:
        activeTenantCount >= maxOccupancy ? 'OCCUPIED' : 'AVAILABLE',
    },
  });
}

async function createConfirmedBookingFromPayment(
  tx: Prisma.TransactionClient,
  validatedData: VerifiedPaymentInput,
) {
  const existingBooking = await findExistingVerifiedBooking(
    tx,
    validatedData.razorpayPaymentId,
  );

  if (existingBooking) {
    return existingBooking;
  }

  const pg = await tx.pG.findUnique({
    where: { id: validatedData.pgId },
    select: {
      id: true,
      name: true,
      isActive: true,
      startingPrice: true,
      securityDeposit: true,
      area: true,
      city: true,
      ownerPhone: true,
    },
  });

  if (!pg?.isActive) {
    throw new Error('PG not found or inactive');
  }

  const room = await resolveBookingRoom(
    tx,
    validatedData.pgId,
    validatedData.roomId,
  );

  const monthlyRent = Number(room?.monthlyRent ?? pg.startingPrice);
  const securityDeposit = Number(room?.securityDeposit ?? pg.securityDeposit);
  const totalAmount = monthlyRent + securityDeposit;
  const moveInDate = new Date(validatedData.checkInDate);

  const createdBooking = await tx.booking.create({
    data: {
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      customerEmail: validatedData.customerEmail || null,
      pgId: validatedData.pgId,
      roomId: validatedData.roomId || null,
      checkInDate: moveInDate,
      monthlyRent,
      securityDeposit,
      totalAmount,
      paidAmount: totalAmount,
      status: 'CONFIRMED',
      notes: [
        validatedData.notes?.trim(),
        `Payment: ${validatedData.razorpayPaymentId}`,
        `Order: ${validatedData.razorpayOrderId}`,
      ]
        .filter(Boolean)
        .join(' | '),
    },
  });

  if (validatedData.roomId) {
    const tenantAssignment = await ensureTenantAssignment(tx, {
      roomId: validatedData.roomId,
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      customerEmail: validatedData.customerEmail || undefined,
      moveInDate,
      monthlyRent,
      totalAmount,
      paymentId: validatedData.razorpayPaymentId,
    });

    if (
      tenantAssignment?.previousRoomId &&
      tenantAssignment.previousRoomId !== validatedData.roomId
    ) {
      await syncRoomOccupancy(tx, tenantAssignment.previousRoomId);
    }

    await syncRoomOccupancy(tx, validatedData.roomId, room?.maxOccupancy);
  }

  return tx.booking.findUnique({
    where: { id: createdBooking.id },
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
}

export async function POST(request: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Razorpay is not configured on the server' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const validatedData = verifySchema.parse(body);

    const pg = await prisma.pG.findUnique({
      where: { id: validatedData.pgId },
      select: {
        razorpayKeyId: true,
        razorpayKeySecret: true,
      },
    });

    const razorpayConfig: RazorpayConfig | undefined =
      pg?.razorpayKeyId && pg.razorpayKeySecret
        ? {
            keyId: pg.razorpayKeyId,
            keySecret: pg.razorpayKeySecret,
          }
        : undefined;

    if (
      !verifySignature(
        validatedData.razorpayOrderId,
        validatedData.razorpayPaymentId,
        validatedData.razorpaySignature,
        razorpayConfig,
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 },
      );
    }

    const booking = await prisma.$transaction((tx) =>
      createConfirmedBookingFromPayment(tx, validatedData),
    );

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to verify payment',
      },
      { status: 500 },
    );
  }
}

