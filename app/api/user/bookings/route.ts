export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tenant information and associated bookings
    const tenant = await prisma.tenant.findFirst({
      where: {
        userId: user.id,
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

    const bookingFilters = [];

    if (user.email) {
      bookingFilters.push({ customerEmail: user.email });
    }

    if (tenant?.roomId) {
      bookingFilters.push({ roomId: tenant.roomId });
    }

    const bookings =
      bookingFilters.length > 0
        ? await prisma.booking.findMany({
            where: {
              OR: bookingFilters,
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
          })
        : [];

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

