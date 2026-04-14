export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import {
  isRoomAvailableForBooking,
  normalizeRoomAvailabilityStatus,
} from '@/lib/rooms/availability';

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
        slug: true,
        description: true,
        address: true,
        area: true,
        city: true,
        state: true,
        pincode: true,
        latitude: true,
        longitude: true,
        ownerName: true,
        ownerPhone: true,
        ownerEmail: true,
        alternatePhone: true,
        startingPrice: true,
        totalRooms: true,
        availableRooms: true,
        createdAt: true,
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            slug: true,
            description: true,
            roomType: true,
            maxOccupancy: true,
            currentOccupancy: true,
            roomSize: true,
            hasBalcony: true,
            hasAttachedBath: true,
            hasAC: true,
            hasFan: true,
            windowDirection: true,
            monthlyRent: true,
            securityDeposit: true,
            maintenanceCharges: true,
            availabilityStatus: true,
            availableFrom: true,
            featured: true,
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
    const normalizedRooms = pg.rooms.map((room) => ({
      ...room,
      availabilityStatus: normalizeRoomAvailabilityStatus(
        room.availabilityStatus,
        room.currentOccupancy,
        room.maxOccupancy,
      ),
      monthlyRent: Number(room.monthlyRent),
      securityDeposit: Number(room.securityDeposit),
      maintenanceCharges: Number(room.maintenanceCharges),
    }));

    const vacantRooms = normalizedRooms.filter((room) =>
      isRoomAvailableForBooking(
        room.availabilityStatus,
        room.currentOccupancy,
        room.maxOccupancy,
      ),
    ).length;
    const occupiedRooms = totalRooms - vacantRooms;

    // Group rooms by type for better organization
    const roomsByType = normalizedRooms.reduce(
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
    const prices = normalizedRooms.map((room) => Number(room.monthlyRent));
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
      ownerPhone: pg.ownerPhone,
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
      rooms: normalizedRooms,
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

