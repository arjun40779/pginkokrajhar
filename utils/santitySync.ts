// Utility functions for syncing data to Sanity
import { createClient } from '@sanity/client';
import { prisma } from '@/prisma';

// Sanity client for writing data
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
});

type SyncAction = 'create' | 'update' | 'delete';

interface SyncToSanityOptions {
  type: 'pg' | 'room';
  action: SyncAction;
  id: string; // Database ID
}

async function syncPGToSanityDirect(pgId: string, action: SyncAction) {
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

    const sanityId = pg.sanityDocumentId || `pg-${pg.id}`;

    if (action === 'delete') {
      await sanityClient.delete(sanityId);
      return { _id: sanityId };
    }

    const dbFields = {
      dbId: pg.id,
      name: pg.name,
      slug: {
        _type: 'slug' as const,
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
              latitude: Number(pg.latitude),
              longitude: Number(pg.longitude),
            }
          : undefined,
      ownerName: pg.ownerName,
      ownerPhone: pg.ownerPhone,
      ownerEmail: pg.ownerEmail,
      startingPrice: Number(pg.startingPrice),
      totalRooms: pg.totalRooms,
      availableRooms: pg.availableRooms,
      roomReferences: pg.rooms
        .filter((room) => room.sanityDocumentId)
        .map((room) => ({
          _type: 'reference' as const,
          _ref: room.sanityDocumentId as string,
        })),
    };

    let result;

    if (!pg.sanityDocumentId) {
      // First-time sync: create a new document with DB-backed fields.
      result = await sanityClient.create({
        _type: 'pg',
        _id: sanityId,
        ...dbFields,
      });
    } else {
      // Subsequent syncs: only patch DB-owned fields so Sanity-only fields stay intact.
      result = await sanityClient.patch(sanityId).set(dbFields).commit();
    }

    // Update PG with Sanity document ID if not exists
    if (!pg.sanityDocumentId) {
      await prisma.pG.update({
        where: { id: pgId },
        data: { sanityDocumentId: result._id },
      });
    }

    return result;
  } catch (error) {
    console.error(`Error syncing PG ${pgId} to Sanity:`, error);
    throw error;
  }
}

async function syncRoomToSanityDirect(roomId: string, action: SyncAction) {
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

    const sanityId = room.sanityDocumentId || `room-${room.id}`;

    if (action === 'delete') {
      // Remove the reference from the parent PG's roomReferences array first,
      // otherwise Sanity blocks the delete due to existing references.
      const pgSanityId = room.pg.sanityDocumentId;
      if (pgSanityId) {
        await sanityClient
          .patch(pgSanityId)
          .unset([`roomReferences[_ref=="${sanityId}"]`])
          .commit();
      }
      await sanityClient.delete(sanityId);
      return { _id: sanityId };
    }

    let pgSanityId = room.pg.sanityDocumentId;

    if (!pgSanityId) {
      const syncedPG = await syncPGToSanityDirect(room.pg.id, 'create');
      pgSanityId = syncedPG._id;
    }

    const sanityDocument = {
      _type: 'room',
      _id: sanityId,
      dbId: room.id,
      roomNumber: room.roomNumber,
      slug: {
        _type: 'slug',
        current: room.slug,
      },
      description: room.description,
      roomType: room.roomType.toLowerCase(),
      maxOccupancy: room.maxOccupancy,
      currentOccupancy: room.currentOccupancy,
      monthlyRent: Number(room.monthlyRent),
      securityDeposit: Number(room.securityDeposit),
      maintenanceCharges: Number(room.maintenanceCharges),
      pgReference: pgSanityId
        ? {
            _type: 'reference',
            _ref: pgSanityId,
          }
        : undefined,
      pgId: room.pgId,
    };

    const result = await sanityClient.createOrReplace(sanityDocument);

    // Update room with Sanity document ID if not exists
    if (!room.sanityDocumentId) {
      await prisma.room.update({
        where: { id: roomId },
        data: { sanityDocumentId: result._id },
      });
    }

    // After creating/updating the room document, refresh the parent PG
    // so its roomReferences array (and other DB-driven fields like
    // totalRooms/availableRooms) stay in sync for the public PG/rooms page.
    await syncPGToSanityDirect(room.pg.id, 'update');

    return result;
  } catch (error) {
    console.error(`Error syncing room ${roomId} to Sanity:`, error);
    throw error;
  }
}

export async function syncToSanity(options: SyncToSanityOptions) {
  try {
    let result;

    if (options.type === 'pg') {
      result = await syncPGToSanityDirect(options.id, options.action);
    } else if (options.type === 'room') {
      result = await syncRoomToSanityDirect(options.id, options.action);
    } else {
      throw new Error(`Unknown sync type: ${options.type}`);
    }

    console.log(
      `Successfully synced ${options.type} ${options.id} to Sanity:`,
      result._id,
    );
    return { sanityDocumentId: result._id };
  } catch (error) {
    console.error('Error syncing to Sanity:', error);
    // Don't throw - we don't want to fail the main operation if Sanity sync fails
    return null;
  }
}

export async function syncPGToSanity(
  pgId: string,
  action: SyncAction = 'create',
) {
  return syncToSanity({ type: 'pg', action, id: pgId });
}

export async function syncRoomToSanity(
  roomId: string,
  action: SyncAction = 'create',
) {
  return syncToSanity({ type: 'room', action, id: roomId });
}

