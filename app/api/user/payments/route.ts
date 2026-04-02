export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';
import { getResidentRentPaymentState } from '@/lib/resident/rentPaymentState';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant information
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: user.id,
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

    return NextResponse.json({
      payments,
      pendingAmount: rentState.pendingAmount,
      nextDueDate: rentState.nextDueDate,
      monthlyRent: tenant.rentAmount,
      rentStatus: rentState.rentStatus,
      rentCycle: rentState.currentCycle,
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

