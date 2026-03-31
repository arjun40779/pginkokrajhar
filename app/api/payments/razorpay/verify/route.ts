import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import {
  getRazorpayKeySecret,
  isRazorpayConfigured,
} from '@/lib/payments/razorpay';
import { isRoomAvailableForBooking } from '@/lib/rooms/availability';

const verifySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
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

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const expectedSignature = createHmac('sha256', getRazorpayKeySecret())
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
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

    if (
      !verifySignature(
        validatedData.razorpayOrderId,
        validatedData.razorpayPaymentId,
        validatedData.razorpaySignature,
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 },
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
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

      let room = null;
      if (validatedData.roomId) {
        room = await tx.room.findFirst({
          where: {
            id: validatedData.roomId,
            pgId: validatedData.pgId,
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
      }

      const monthlyRent = Number(room?.monthlyRent ?? pg.startingPrice);
      const securityDeposit = Number(
        room?.securityDeposit ?? pg.securityDeposit,
      );
      const totalAmount = monthlyRent + securityDeposit;

      const createdBooking = await tx.booking.create({
        data: {
          customerName: validatedData.customerName,
          customerPhone: validatedData.customerPhone,
          customerEmail: validatedData.customerEmail || null,
          pgId: validatedData.pgId,
          roomId: validatedData.roomId || null,
          checkInDate: new Date(validatedData.checkInDate),
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
        await tx.room.update({
          where: { id: validatedData.roomId },
          data: { availabilityStatus: 'RESERVED' },
        });
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
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten() },
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
