export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

// GET /api/rooms - List all available rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const roomType = searchParams.get('roomType'); // SINGLE, DOUBLE, TRIPLE, DORMITORY
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const city = searchParams.get('city');
    const area = searchParams.get('area');
    const availableOnly = searchParams.get('available') !== 'false'; // default true

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      pg: {
        isActive: true,
      },
    };

    // Add availability filter
    if (availableOnly) {
      where.availabilityStatus = 'AVAILABLE';
    }

    // Add room type filter
    if (roomType) {
      where.roomType = roomType;
    }

    // Add price range filters
    if (minPrice) {
      where.monthlyRent = {
        ...where.monthlyRent,
        gte: Number.parseFloat(minPrice),
      };
    }
    if (maxPrice) {
      where.monthlyRent = {
        ...where.monthlyRent,
        lte: Number.parseFloat(maxPrice),
      };
    }

    // Add location filters
    if (city) {
      where.pg = {
        ...where.pg,
        city: {
          contains: city,
          mode: 'insensitive',
        },
      };
    }
    if (area) {
      where.pg = {
        ...where.pg,
        area: {
          contains: area,
          mode: 'insensitive',
        },
      };
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: 'desc' }, { monthlyRent: 'asc' }],
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
          createdAt: true,
          pg: {
            select: {
              id: true,
              name: true,
              slug: true,
              area: true,
              city: true,
              state: true,
              ownerPhone: true,
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return NextResponse.json({
      rooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        roomType,
        minPrice,
        maxPrice,
        city,
        area,
        availableOnly,
      },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 },
    );
  }
}

