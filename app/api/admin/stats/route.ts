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

    // Check if user is admin
    const userProfile = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!userProfile || userProfile.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalPGs,
      totalRooms,
      occupiedRooms,
      totalBookings,
      pendingPayments,
      completedPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pG.count(),
      prisma.room.count(),
      prisma.room.count({ where: { availabilityStatus: 'OCCUPIED' } }),
      prisma.booking.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = completedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return NextResponse.json({
      totalUsers,
      totalPGs,
      totalRooms,
      occupiedRooms,
      totalBookings,
      pendingPayments,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
