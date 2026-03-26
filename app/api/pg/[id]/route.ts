import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

// GET /api/pg/[id] - Get PG details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log('API Route called with ID:', params.id);
    const { id } = params;

    // Validate ID format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid PG ID format',
        },
        { status: 400 },
      );
    }

    // Fetch PG with detailed information
    const pg = await prisma.pG.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        address: true,
        area: true,
        city: true,
        state: true,
        pincode: true,
        latitude: true,
        longitude: true,
        description: true,
        createdAt: true,
        rooms: {
          select: {
            id: true,
            roomType: true,
            monthlyRent: true,
            availabilityStatus: true,
          },
          orderBy: {
            roomNumber: 'asc',
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!pg) {
      return NextResponse.json(
        {
          success: false,
          error: 'PG not found',
        },
        { status: 404 },
      );
    }

    // Calculate room statistics
    const totalRooms = pg.rooms.length;
    const vacantRooms = pg.rooms.filter(
      (room) => room.availabilityStatus === 'VACANT',
    ).length;
    const occupiedRooms = totalRooms - vacantRooms;

    // Group rooms by type for better organization
    const roomsByType = pg.rooms.reduce(
      (acc, room) => {
        if (!acc[room.roomType]) {
          acc[room.roomType] = [];
        }
        acc[room.roomType].push(room);
        return acc;
      },
      {} as Record<string, typeof pg.rooms>,
    );

    // Calculate price range
    const prices = pg.rooms.map((room) => Number(room.monthlyRent));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Get recent inquiries count (from last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInquiries = await prisma.inquiry.count({
      where: {
        pgId: id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Format the response with comprehensive details
    const pgDetails = {
      id: pg.id,
      name: pg.name,
      // Location composite
      location: {
        address: pg.address,
        area: pg.area,
        city: pg.city,
        state: pg.state,
        pincode: pg.pincode,
        coordinates: {
          lat: pg.latitude,
          lng: pg.longitude,
        },
      },
      description: pg.description,
      createdAt: pg.createdAt,
      stats: {
        totalRooms,
        vacantRooms,
        occupiedRooms,
        occupancyRate:
          totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        recentInquiries,
      },
      pricing: {
        minPrice,
        maxPrice,
        range:
          minPrice === maxPrice
            ? `₹${minPrice}`
            : `₹${minPrice} - ₹${maxPrice}`,
      },
      rooms: pg.rooms,
      roomsByType,
    };

    return NextResponse.json({
      success: true,
      data: pgDetails,
    });
  } catch (error) {
    console.error('Error fetching PG details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
