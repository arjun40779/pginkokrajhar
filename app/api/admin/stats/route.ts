export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';

function getMonthBuckets(monthCount: number) {
  const currentDate = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (monthCount - 1 - index),
      1,
    );

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('en-IN', { month: 'short' }),
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    };
  });
}

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

    if (userProfile?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    const monthBuckets = getMonthBuckets(6);
    const trendStartDate = monthBuckets[0]?.start ?? new Date();

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalPGs,
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalBookings,
      pendingBookings,
      totalInquiries,
      newInquiries,
      activeTenants,
      pendingPayments,
      completedPayments,
      recentBookings,
      recentInquiries,
      bookingsForTrend,
      paymentsForTrend,
      reservedRooms,
      maintenanceRooms,
      vacantRooms,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pG.count(),
      prisma.room.count(),
      prisma.room.count({ where: { availabilityStatus: 'OCCUPIED' } }),
      prisma.room.count({ where: { availabilityStatus: 'AVAILABLE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          pg: { select: { name: true } },
          room: { select: { roomNumber: true } },
        },
      }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          pg: { select: { name: true } },
        },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: trendStartDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          paymentDate: {
            not: null,
            gte: trendStartDate,
          },
        },
        select: {
          amount: true,
          paymentDate: true,
        },
      }),
      prisma.room.count({ where: { availabilityStatus: 'RESERVED' } }),
      prisma.room.count({ where: { availabilityStatus: 'MAINTENANCE' } }),
      prisma.room.count({ where: { availabilityStatus: 'VACANT' } }),
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = completedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const monthlyTrends = monthBuckets.map((bucket) => {
      const bookings = bookingsForTrend.filter(
        (booking) =>
          booking.createdAt >= bucket.start && booking.createdAt < bucket.end,
      ).length;

      const revenue = paymentsForTrend.reduce((sum, payment) => {
        if (!payment.paymentDate) {
          return sum;
        }

        return payment.paymentDate >= bucket.start &&
          payment.paymentDate < bucket.end
          ? sum + Number(payment.amount)
          : sum;
      }, 0);

      return {
        month: bucket.label,
        bookings,
        revenue,
      };
    });

    const roomStatusBreakdown = [
      { name: 'Occupied', value: occupiedRooms },
      { name: 'Available', value: availableRooms },
      { name: 'Reserved', value: reservedRooms },
      { name: 'Maintenance', value: maintenanceRooms },
      { name: 'Vacant', value: vacantRooms },
    ].filter((item) => item.value > 0);

    return NextResponse.json({
      totalUsers,
      totalPGs,
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalBookings,
      pendingBookings,
      totalInquiries,
      newInquiries,
      activeTenants,
      pendingPayments,
      monthlyRevenue,
      occupancyRate,
      recentBookings,
      recentInquiries,
      monthlyTrends,
      roomStatusBreakdown,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

