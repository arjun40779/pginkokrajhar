export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';
import {
  formatPaymentMonth,
  getResidentRentPaymentState,
} from '@/lib/resident/rentPaymentState';
import {
  getRazorpayClient,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from '@/lib/payments/razorpay';

export async function POST() {
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

    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        moveInDate: true,
        rentAmount: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'No active tenant profile found' },
        { status: 404 },
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const rentState = getResidentRentPaymentState(
      {
        moveInDate: tenant.moveInDate,
        rentAmount: tenant.rentAmount,
      },
      payments,
    );

    if (!rentState.currentCycle?.canPayNow) {
      return NextResponse.json(
        { error: 'Rent payment is not due yet' },
        { status: 409 },
      );
    }

    const paymentRecord = rentState.currentCycle.paymentId
      ? await prisma.payment.findUnique({
          where: {
            id: rentState.currentCycle.paymentId,
          },
        })
      : await prisma.payment.upsert({
          where: {
            tenantId_month: {
              tenantId: tenant.id,
              month: formatPaymentMonth(rentState.currentCycle.dueDate),
            },
          },
          update: {
            amount: rentState.currentCycle.amount,
            dueDate: rentState.currentCycle.dueDate,
            status: 'PENDING',
          },
          create: {
            tenantId: tenant.id,
            amount: rentState.currentCycle.amount,
            status: 'PENDING',
            dueDate: rentState.currentCycle.dueDate,
            month: formatPaymentMonth(rentState.currentCycle.dueDate),
            notes: 'Generated from resident dashboard rent checkout',
          },
        });

    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Unable to prepare rent payment' },
        { status: 500 },
      );
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(Number(paymentRecord.amount) * 100),
      currency: 'INR',
      receipt: `rent_${paymentRecord.id.slice(-10)}_${Date.now()}`,
      notes: {
        paymentId: paymentRecord.id,
        tenantId: tenant.id,
        month: paymentRecord.month,
        flow: 'resident-rent',
      },
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      payment: {
        id: paymentRecord.id,
        amount: Number(paymentRecord.amount),
        dueDate: paymentRecord.dueDate,
        month: paymentRecord.month,
      },
      tenant: {
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
      },
    });
  } catch (error) {
    console.error('Error creating resident rent order:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create rent order',
      },
      { status: 500 },
    );
  }
}

