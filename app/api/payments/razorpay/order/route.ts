export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import {
  getRazorpayClient,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from '@/lib/payments/razorpay';
import { isRoomAvailableForBooking } from '@/lib/rooms/availability';

const orderSchema = z.object({
  pgId: z.uuid('Valid PG ID is required'),
  roomId: z.uuid('Valid room ID is required').optional(),
});

export async function POST(request: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Razorpay is not configured on the server' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { pgId, roomId } = orderSchema.parse(body);

    const pg = await prisma.pG.findUnique({
      where: { id: pgId },
      select: {
        id: true,
        name: true,
        isActive: true,
        startingPrice: true,
        securityDeposit: true,
      },
    });

    if (!pg?.isActive) {
      return NextResponse.json(
        { error: 'PG not found or inactive' },
        { status: 404 },
      );
    }

    let room = null;

    if (roomId) {
      room = await prisma.room.findFirst({
        where: { id: roomId, pgId, isActive: true },
        select: {
          id: true,
          roomNumber: true,
          roomType: true,
          availabilityStatus: true,
          currentOccupancy: true,
          maxOccupancy: true,
          monthlyRent: true,
          securityDeposit: true,
        },
      });

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (
        !isRoomAvailableForBooking(
          room.availabilityStatus,
          room.currentOccupancy,
          room.maxOccupancy,
        )
      ) {
        return NextResponse.json(
          { error: 'Room is no longer available for checkout' },
          { status: 409 },
        );
      }
    }

    const monthlyRent = Number(room?.monthlyRent ?? pg.startingPrice);
    const securityDeposit = Number(room?.securityDeposit ?? pg.securityDeposit);
    const totalAmount = monthlyRent + securityDeposit;

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `pgk_${Date.now()}_${(room?.id ?? pg.id).slice(-8)}`,
      notes: {
        pgId,
        roomId: room?.id ?? '',
        pgName: pg.name,
        roomNumber: room?.roomNumber ?? '',
      },
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      pricing: {
        monthlyRent,
        securityDeposit,
        totalAmount,
      },
      property: {
        pgId: pg.id,
        pgName: pg.name,
        roomId: room?.id ?? null,
        roomNumber: room?.roomNumber ?? null,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 },
    );
  }
}

