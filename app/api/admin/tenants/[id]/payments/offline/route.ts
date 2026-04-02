export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import {
  addOneMonth,
  formatPaymentMonth,
  getResidentRentPaymentState,
} from '@/lib/resident/rentPaymentState';

const offlinePaymentSchema = z.object({
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment date must be in YYYY-MM-DD format')
    .optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = offlinePaymentSchema.parse(body);

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        roomId: true,
        moveInDate: true,
        rentAmount: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const bookingFilters = [] as Array<{
      customerEmail?: string;
      roomId?: string;
    }>;

    if (tenant.email) {
      bookingFilters.push({ customerEmail: tenant.email });
    }

    if (tenant.roomId) {
      bookingFilters.push({ roomId: tenant.roomId });
    }

    const bookings =
      bookingFilters.length > 0
        ? await prisma.booking.findMany({
            where: {
              OR: bookingFilters,
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : [];

    const rentState = getResidentRentPaymentState(
      {
        moveInDate: tenant.moveInDate,
        rentAmount: tenant.rentAmount,
      },
      payments,
      bookings,
    );

    if (!rentState.currentCycle) {
      return NextResponse.json(
        { error: 'No rent cycle available for this tenant' },
        { status: 409 },
      );
    }

    if (rentState.currentCycle.status === 'UPCOMING') {
      return NextResponse.json(
        {
          error:
            'Current rent period is already paid. The next rent cycle is not due yet.',
        },
        { status: 409 },
      );
    }

    const paymentTimestamp = validatedData.paymentDate
      ? new Date(`${validatedData.paymentDate}T12:00:00.000Z`)
      : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const paymentRecord = rentState.currentCycle?.paymentId
        ? await tx.payment.findUnique({
            where: {
              id: rentState.currentCycle.paymentId,
            },
          })
        : await tx.payment.upsert({
            where: {
              tenantId_month: {
                tenantId: tenant.id,
                month: rentState.currentCycle!.month,
              },
            },
            update: {
              amount: rentState.currentCycle!.amount,
              dueDate: rentState.currentCycle!.dueDate,
              status: 'PENDING',
            },
            create: {
              tenantId: tenant.id,
              amount: rentState.currentCycle!.amount,
              status: 'PENDING',
              dueDate: rentState.currentCycle!.dueDate,
              month: rentState.currentCycle!.month,
              notes: 'Generated for offline rent settlement',
            },
          });

      if (!paymentRecord) {
        throw new Error('Unable to create or find payment record');
      }

      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentRecord.id,
        },
        data: {
          status: 'COMPLETED',
          paymentDate: paymentTimestamp,
          notes: [
            paymentRecord.notes,
            'Offline payment recorded by admin',
            validatedData.notes,
          ]
            .filter(Boolean)
            .join(' | '),
        },
      });

      await tx.tenant.update({
        where: {
          id: tenant.id,
        },
        data: {
          rentStatus: 'PAID',
        },
      });

      const nextDueDate = addOneMonth(updatedPayment.dueDate);
      const nextMonth = formatPaymentMonth(nextDueDate);
      const existingNextPayment = await tx.payment.findFirst({
        where: {
          tenantId: tenant.id,
          month: nextMonth,
        },
        select: {
          id: true,
        },
      });

      if (!existingNextPayment) {
        await tx.payment.create({
          data: {
            tenantId: tenant.id,
            amount: tenant.rentAmount,
            status: 'PENDING',
            dueDate: nextDueDate,
            month: nextMonth,
            notes: 'Auto-generated next monthly rent cycle',
          },
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({
      success: true,
      payment: result,
    });
  } catch (error) {
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

    console.error('Error recording offline payment:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to record offline payment',
      },
      { status: 500 },
    );
  }
}

