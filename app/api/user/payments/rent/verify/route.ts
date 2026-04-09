export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';
import {
  addOneMonth,
  formatPaymentMonth,
} from '@/lib/resident/rentPaymentState';
import {
  getRazorpayKeySecret,
  isRazorpayConfigured,
  type RazorpayConfig,
} from '@/lib/payments/razorpay';

const verifySchema = z.object({
  paymentId: z.uuid('Valid payment ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

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

export async function POST(request: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Razorpay is not configured on the server' },
      { status: 503 },
    );
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = verifySchema.parse(body);

    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        rentAmount: true,
        room: {
          select: {
            pg: {
              select: {
                razorpayKeyId: true,
                razorpayKeySecret: true,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'No active tenant profile found' },
        { status: 404 },
      );
    }

    const pgConfig = tenant.room?.pg;
    const razorpayConfig: RazorpayConfig | undefined =
      pgConfig?.razorpayKeyId && pgConfig.razorpayKeySecret
        ? {
            keyId: pgConfig.razorpayKeyId,
            keySecret: pgConfig.razorpayKeySecret,
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

    const payment = await prisma.payment.findFirst({
      where: {
        id: validatedData.paymentId,
        tenantId: tenant.id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment =
        payment.status === 'COMPLETED'
          ? payment
          : await tx.payment.update({
              where: {
                id: payment.id,
              },
              data: {
                status: 'COMPLETED',
                paymentDate: new Date(),
                notes: [
                  payment.notes,
                  `Rent payment via Razorpay (${validatedData.razorpayPaymentId})`,
                  `Order: ${validatedData.razorpayOrderId}`,
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
    console.error('Error verifying resident rent payment:', error);

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

