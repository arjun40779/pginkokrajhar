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

    // Get user's tenant information and associated bookings
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: authUser.id,
        isActive: true,
      },
      include: {
        room: {
          include: {
            pg: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ bookings: [], tenant: null });
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ customerEmail: authUser.email }, { roomId: tenant.roomId }],
      },
      include: {
        room: {
          include: {
            pg: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      tenant,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
