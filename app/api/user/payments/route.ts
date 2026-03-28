import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant information
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: authUser.id,
        isActive: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({
        payments: [],
        pendingAmount: 0,
        nextDueDate: null,
      });
    }

    // Get user's payment history
    const payments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate pending payments and next due date
    const pendingPayments = payments.filter((p) => p.status === 'PENDING');
    const pendingAmount = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Calculate next due date (assume monthly rent)
    const lastPayment = payments.find((p) => p.status === 'COMPLETED');
    const nextDueDate = lastPayment
      ? new Date(lastPayment.paymentDate || lastPayment.createdAt).setMonth(
          new Date(
            lastPayment.paymentDate || lastPayment.createdAt,
          ).getMonth() + 1,
        )
      : new Date();

    return NextResponse.json({
      payments,
      pendingAmount,
      nextDueDate,
      monthlyRent: tenant.rentAmount,
      rentStatus: tenant.rentStatus,
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
