export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { prisma } from '@/prisma';

// Sanity client for writing data
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!, // Write token needed
  apiVersion: '2024-01-01',
  useCdn: false,
});

interface SyncToDabaseBody {
  type: 'pg' | 'room';
  action: 'create' | 'update';
  id: string; // Database ID
}

async function syncPGToSanity(pgId: string, action: 'create' | 'update') {
  try {
    const pg = await prisma.pG.findUnique({
      where: { id: pgId },
      include: {
        rooms: {
          select: {
            sanityDocumentId: true,
          },
        },
      },
    });

    if (!pg) {
      throw new Error(`PG with ID ${pgId} not found in database`);
    }

    const sanityDocument = {
      _type: 'pg',
      _id: pg.sanityDocumentId || `pg-${pg.id}`,
      dbId: pg.id,
      name: pg.name,
      slug: {
        _type: 'slug',
        current: pg.slug,
      },
      description: pg.description,
      isActive: pg.isActive,
      address: pg.address,
      area: pg.area,
      city: pg.city,
      state: pg.state,
      pincode: pg.pincode,
      coordinates:
        pg.latitude && pg.longitude
          ? {
              latitude: pg.latitude,
              longitude: pg.longitude,
            }
          : undefined,
      ownerName: pg.ownerName,
      ownerPhone: pg.ownerPhone,
      ownerEmail: pg.ownerEmail,
      alternatePhone: pg.alternatePhone,
      startingPrice: Number(pg.startingPrice),
      securityDeposit: Number(pg.securityDeposit),
      brokerageCharges: Number(pg.brokerageCharges),
      totalRooms: pg.totalRooms,
      availableRooms: pg.availableRooms,
      roomReferences: pg.rooms
        .filter((room) => room.sanityDocumentId)
        .map((room) => ({
          _type: 'reference',
          _ref: room.sanityDocumentId as string,
        })),
    };

    let result;
    if (action === 'create' || !pg.sanityDocumentId) {
      // Create new document in Sanity
      result = await sanityClient.create(sanityDocument);

      // Update the database with the Sanity document ID
      await prisma.pG.update({
        where: { id: pgId },
        data: { sanityDocumentId: result._id },
      });

      console.log(`Created PG in Sanity: ${result._id}`);
    } else {
      // Update existing document in Sanity
      result = await sanityClient.createOrReplace(sanityDocument);
      console.log(`Updated PG in Sanity: ${result._id}`);
    }

    return result;
  } catch (error) {
    console.error('Error syncing PG to Sanity:', error);
    throw error;
  }
}

async function syncRoomToSanity(roomId: string, action: 'create' | 'update') {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        pg: true,
      },
    });

    if (!room) {
      throw new Error(`Room with ID ${roomId} not found in database`);
    }

    // Make sure the PG exists in Sanity first
    let pgSanityId = room.pg.sanityDocumentId;
    if (!pgSanityId) {
      // Sync PG to Sanity first
      const pgResult = await syncPGToSanity(room.pg.id, 'create');
      pgSanityId = pgResult._id;
    }

    const sanityDocument = {
      _type: 'room',
      _id: room.sanityDocumentId || `room-${room.id}`,
      dbId: room.id,
      roomNumber: room.roomNumber,
      slug: {
        _type: 'slug',
        current: room.slug,
      },
      description: room.description,
      isActive: room.isActive,
      roomType: room.roomType,
      maxOccupancy: room.maxOccupancy,
      currentOccupancy: room.currentOccupancy,
      floor: room.floor,
      roomSize: room.roomSize,
      hasBalcony: room.hasBalcony,
      hasAttachedBath: room.hasAttachedBath,
      hasAC: room.hasAC,
      hasFan: room.hasFan,
      windowDirection: room.windowDirection,
      monthlyRent: Number(room.monthlyRent),
      securityDeposit: Number(room.securityDeposit),
      maintenanceCharges: Number(room.maintenanceCharges),
      electricityIncluded: room.electricityIncluded,
      availabilityStatus: room.availabilityStatus,
      availableFrom: room.availableFrom?.toISOString(),
      pgReference: {
        _type: 'reference',
        _ref: pgSanityId,
      },
      pgId: room.pgId,
      featured: room.featured,
    };

    let result;
    if (action === 'create' || !room.sanityDocumentId) {
      // Create new document in Sanity
      result = await sanityClient.create(sanityDocument);

      // Update the database with the Sanity document ID
      await prisma.room.update({
        where: { id: roomId },
        data: { sanityDocumentId: result._id },
      });

      console.log(`Created Room in Sanity: ${result._id}`);
    } else {
      // Update existing document in Sanity
      result = await sanityClient.createOrReplace(sanityDocument);
      console.log(`Updated Room in Sanity: ${result._id}`);
    }

    return result;
  } catch (error) {
    console.error('Error syncing Room to Sanity:', error);
    throw error;
  }
}

// POST /api/sync/sanity - Sync database data to Sanity
export async function POST(request: NextRequest) {
  try {
    const body: SyncToDabaseBody = await request.json();

    if (!body.type || !body.action || !body.id) {
      return NextResponse.json(
        { error: 'Missing required fields: type, action, id' },
        { status: 400 },
      );
    }

    if (!['pg', 'room'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "pg" or "room"' },
        { status: 400 },
      );
    }

    if (!['create', 'update'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "create" or "update"' },
        { status: 400 },
      );
    }

    let result;
    if (body.type === 'pg') {
      result = await syncPGToSanity(body.id, body.action);
    } else {
      result = await syncRoomToSanity(body.id, body.action);
    }

    return NextResponse.json({
      message: `Successfully synced ${body.type} to Sanity`,
      sanityDocumentId: result._id,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET /api/sync/sanity - Sync all PGs and Rooms to Sanity (bulk operation)
export async function GET() {
  try {
    // Get all PGs and Rooms without Sanity document IDs
    const [pgsToSync, roomsToSync] = await Promise.all([
      prisma.pG.findMany({
        where: {
          OR: [{ sanityDocumentId: null }, { sanityDocumentId: '' }],
        },
      }),
      prisma.room.findMany({
        where: {
          OR: [{ sanityDocumentId: null }, { sanityDocumentId: '' }],
        },
      }),
    ]);

    const results = {
      synced: {
        pgs: 0,
        rooms: 0,
      },
      errors: [] as string[],
    };

    // Sync PGs first
    for (const pg of pgsToSync) {
      try {
        await syncPGToSanity(pg.id, 'create');
        results.synced.pgs++;
      } catch (error) {
        results.errors.push(
          `PG ${pg.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Sync Rooms
    for (const room of roomsToSync) {
      try {
        await syncRoomToSanity(room.id, 'create');
        results.synced.rooms++;
      } catch (error) {
        results.errors.push(
          `Room ${room.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return NextResponse.json({
      message: 'Bulk sync completed',
      ...results,
    });
  } catch (error) {
    console.error('Bulk sync error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

