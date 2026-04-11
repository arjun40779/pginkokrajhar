export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isRoomAvailableForBooking } from '@/lib/rooms/availability';

// GET /api/pg - List all PGs
export async function GET(request: NextRequest) {
  try {
    // Get all PGs with room counts and basic stats
    const pgs = await prisma.pG.findMany({
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
        _count: {
          select: {
            rooms: true,
          },
        },
        rooms: {
          select: {
            availabilityStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate vacancy stats for each PG
    const pgsWithStats = pgs.map((pg) => {
      const totalRooms = pg.rooms.length;
      const vacantRooms = pg.rooms.filter((room) =>
        isRoomAvailableForBooking(room.availabilityStatus),
      ).length;
      const occupiedRooms = totalRooms - vacantRooms;

      return {
        id: pg.id,
        name: pg.name,
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
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: pgsWithStats,
    });
  } catch (error) {
    console.error('Error fetching PGs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PGs',
      },
      { status: 500 },
    );
  }
}

// POST /api/pg - Create new PG (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authorization header required',
        },
        { status: 401 },
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
        },
        { status: 401 },
      );
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: {
        mobile: decodedToken.phone_number.replace('+91', ''), // Remove +91 prefix
      },
      select: {
        id: true,
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 },
      );
    }

    if (!user.roles.includes('ADMIN')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
        },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, location, description } = body;

    // Validate required fields
    if (!name || !location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and location are required',
        },
        { status: 400 },
      );
    }

    // Create new PG
    const newPG = await prisma.pG.create({
      data: {
        name: name.trim(),
        location: location.trim(),
        description: description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'PG created successfully',
      data: newPG,
    });
  } catch (error) {
    console.error('Error creating PG:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create PG',
      },
      { status: 500 },
    );
  }
}

