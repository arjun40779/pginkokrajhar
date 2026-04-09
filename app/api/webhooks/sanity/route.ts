export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/prisma';
import { buildRoomSlug, slugifySegment } from '@/lib/rooms/slug';

// Sanity webhook secret - should be stored in environment variables
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET || '';

interface SanityWebhookPayload {
  _type: 'webhook';
  _id: string;
  projectId: string;
  dataset: string;
  operation: 'create' | 'update' | 'delete';
  document: {
    _id: string;
    _type: string;
    _rev: string;
    [key: string]: any;
  };
  previous?: {
    _id: string;
    _type: string;
    _rev: string;
    [key: string]: any;
  };
}

const BASE_PUBLIC_REVALIDATION_PATHS = ['/', '/contact', '/pgs'] as const;

function normalizeSlugValue(
  slug: string | { current?: string } | null | undefined,
): string | null {
  let rawSlug = '';

  if (typeof slug === 'string') {
    rawSlug = slug;
  } else if (typeof slug?.current === 'string') {
    rawSlug = slug.current;
  }

  let normalizedSlug = rawSlug.trim();

  while (normalizedSlug.startsWith('/')) {
    normalizedSlug = normalizedSlug.slice(1);
  }

  while (normalizedSlug.endsWith('/')) {
    normalizedSlug = normalizedSlug.slice(0, -1);
  }

  return normalizedSlug || null;
}

async function resolvePGRoomListingPath(
  document: SanityWebhookPayload['document'],
): Promise<string | null> {
  const directSlug = normalizeSlugValue(document.slug);

  if (document._type === 'pg' && directSlug) {
    return `/pgs/${directSlug}/rooms`;
  }

  if (document._type !== 'room') {
    return null;
  }

  if (typeof document.pgId === 'string' && document.pgId) {
    const pg = await prisma.pG.findUnique({
      where: { id: document.pgId },
      select: { slug: true },
    });

    if (pg?.slug) {
      return `/pgs/${pg.slug}/rooms`;
    }
  }

  const sanityPgReference =
    document.pgReference?._ref || document.pg?._ref || null;

  if (!sanityPgReference) {
    return null;
  }

  const pg = await prisma.pG.findFirst({
    where: { sanityDocumentId: sanityPgReference },
    select: { slug: true },
  });

  return pg?.slug ? `/pgs/${pg.slug}/rooms` : null;
}

async function revalidateDocumentPaths(payload: SanityWebhookPayload) {
  const paths = new Set<string>(BASE_PUBLIC_REVALIDATION_PATHS);
  const documentSlug = normalizeSlugValue(payload.document.slug);

  if (payload.document._type === 'pageSection') {
    paths.add(
      documentSlug && documentSlug !== 'home' ? `/${documentSlug}` : '/',
    );
  }

  if (payload.document._type === 'pg' && payload.document.dbId) {
    paths.add(`/pg/${payload.document.dbId}`);
    paths.add('/pgs');
  }

  if (payload.document._type === 'room' && documentSlug) {
    paths.add(`/rooms/${documentSlug}`);
    paths.add('/pgs');
  }

  const pgRoomListingPath = await resolvePGRoomListingPath(payload.document);

  if (pgRoomListingPath) {
    paths.add(pgRoomListingPath);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return [...paths];
}

interface PGDocument {
  _id: string;
  _type: 'pg';
  dbId?: string;
  name: string;
  slug: { current: string };
  description?: string;
  isActive: boolean;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  alternatePhone?: string;
  roomReferences?: Array<{
    _ref: string;
  }>;
}

interface RoomDocument {
  _id: string;
  _type: 'room';
  dbId?: string;
  roomNumber: string;
  slug: { current: string };
  description?: string;
  isActive: boolean;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  floor: number;
  roomSize?: number;
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  hasFan: boolean;
  windowDirection?: string;
  electricityIncluded: boolean;
  pgId?: string;
  pgReference?: {
    _ref: string;
  };
  pg?: {
    _ref: string;
  };
  featured: boolean;
}

function verifySignature(payload: string, signature: string): boolean {
  if (!SANITY_WEBHOOK_SECRET) {
    console.warn('SANITY_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = createHmac('sha256', SANITY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

async function generateUniqueSlug(
  name: string,
  type: 'pg' | 'room',
): Promise<string> {
  const baseSlug = slugifySegment(name);

  let slug = baseSlug;
  let counter = 1;

  const table = type === 'pg' ? 'pG' : 'room';

  while (true) {
    const existing = await prisma[table].findUnique({
      where: { slug },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function syncPGToDatabase(
  document: PGDocument,
  operation: 'create' | 'update',
): Promise<void> {
  try {
    const slug = await generateUniqueSlug(document.name, 'pg');

    const pgData = {
      name: document.name,
      slug: document.slug?.current || slug,
      description: document.description || null,
      isActive: document.isActive !== false,
      address: document.address,
      area: document.area,
      city: document.city,
      state: document.state,
      pincode: document.pincode,
      latitude: document.coordinates?.latitude || null,
      longitude: document.coordinates?.longitude || null,
      ownerName: document.ownerName,
      ownerPhone: document.ownerPhone,
      ownerEmail: document.ownerEmail || null,
      alternatePhone: document.alternatePhone || null,
      // Default pricing values - these will be managed in the admin panel
      startingPrice: 0,
      securityDeposit: 0,
      brokerageCharges: 0,
      totalRooms: 0,
      availableRooms: 0,
      sanityDocumentId: document._id,
    };

    if (operation === 'create' || !document.dbId) {
      // Create new PG
      const newPG = await prisma.pG.create({
        data: pgData,
      });

      console.log(`Created PG in database: ${newPG.id}`);
    } else {
      // Update existing PG
      await prisma.pG.update({
        where: { id: document.dbId },
        data: {
          ...pgData,
          // Don't override pricing and room counts during updates
          startingPrice: undefined,
          securityDeposit: undefined,
          brokerageCharges: undefined,
          totalRooms: undefined,
          availableRooms: undefined,
        },
      });

      console.log(`Updated PG in database: ${document.dbId}`);
    }
  } catch (error) {
    console.error('Error syncing PG to database:', error);
    throw error;
  }
}

async function syncRoomToDatabase(
  document: RoomDocument,
  operation: 'create' | 'update',
): Promise<void> {
  try {
    // Find the PG by Sanity reference or dbId
    let pgId = document.pgId;

    const sanityPgReference = document.pgReference?._ref || document.pg?._ref;

    if (!pgId && sanityPgReference) {
      // Try to find PG by Sanity document ID
      const pg = await prisma.pG.findFirst({
        where: { sanityDocumentId: sanityPgReference },
      });

      if (!pg) {
        throw new Error(
          `PG not found for Sanity reference: ${sanityPgReference}`,
        );
      }

      pgId = pg.id;
    }

    if (!pgId) {
      throw new Error('No PG ID or reference found for room');
    }

    const pgRecord = await prisma.pG.findUnique({
      where: { id: pgId },
      select: { slug: true, name: true },
    });

    if (!pgRecord) {
      throw new Error(`PG not found for ID: ${pgId}`);
    }

    const slug =
      document.slug?.current ||
      buildRoomSlug(pgRecord.slug || pgRecord.name, document.roomNumber);

    const roomData = {
      roomNumber: document.roomNumber,
      slug,
      description: document.description || null,
      isActive: document.isActive !== false,
      roomType: document.roomType,
      maxOccupancy: document.maxOccupancy,
      floor: document.floor,
      roomSize: document.roomSize || null,
      hasBalcony: document.hasBalcony || false,
      hasAttachedBath: document.hasAttachedBath || false,
      hasAC: document.hasAC || false,
      hasFan: document.hasFan !== false,
      windowDirection: document.windowDirection || null,
      electricityIncluded: document.electricityIncluded !== false,
      pgId: pgId,
      featured: document.featured || false,
      // Default values - these will be managed in the admin panel
      currentOccupancy: 0,
      monthlyRent: 0,
      securityDeposit: 0,
      maintenanceCharges: 0,
      availabilityStatus: 'AVAILABLE',
      sanityDocumentId: document._id,
    };

    if (operation === 'create' || !document.dbId) {
      // Create new Room
      const newRoom = await prisma.room.create({
        data: roomData,
      });

      // Update PG room counts
      await updatePGRoomCounts(pgId);

      console.log(`Created Room in database: ${newRoom.id}`);
    } else {
      // Update existing Room
      await prisma.room.update({
        where: { id: document.dbId },
        data: {
          ...roomData,
          // Don't override pricing and occupancy during updates
          currentOccupancy: undefined,
          monthlyRent: undefined,
          securityDeposit: undefined,
          maintenanceCharges: undefined,
          availabilityStatus: undefined,
        },
      });

      console.log(`Updated Room in database: ${document.dbId}`);
    }
  } catch (error) {
    console.error('Error syncing Room to database:', error);
    throw error;
  }
}

async function updatePGRoomCounts(pgId: string): Promise<void> {
  try {
    const roomCounts = await prisma.room.aggregate({
      where: { pgId: pgId },
      _count: { id: true },
    });

    const availableRooms = await prisma.room.count({
      where: {
        pgId: pgId,
        availabilityStatus: 'AVAILABLE',
      },
    });

    await prisma.pG.update({
      where: { id: pgId },
      data: {
        totalRooms: roomCounts._count.id,
        availableRooms: availableRooms,
      },
    });
  } catch (error) {
    console.error('Error updating PG room counts:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('sanity-webhook-signature') || '';

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 },
      );
    }

    const payload: SanityWebhookPayload = JSON.parse(body);

    // Only handle create and update operations for pg and room documents
    if (
      !['create', 'update'].includes(payload.operation) ||
      !['pg', 'room'].includes(payload.document._type)
    ) {
      return NextResponse.json({ message: 'Operation not handled' });
    }

    const document = payload.document;
    const operation = payload.operation;

    console.log(
      `Processing ${operation} operation for ${document._type}:`,
      document._id,
    );

    const shouldSyncToDatabase =
      payload.operation === 'create' || payload.operation === 'update';
    const syncOperation: 'create' | 'update' =
      payload.operation === 'create' ? 'create' : 'update';

    if (shouldSyncToDatabase && document._type === 'pg') {
      await syncPGToDatabase(document as unknown as PGDocument, syncOperation);
    } else if (shouldSyncToDatabase && document._type === 'room') {
      await syncRoomToDatabase(
        document as unknown as RoomDocument,
        syncOperation,
      );
    }

    const revalidatedPaths = await revalidateDocumentPaths(payload);

    return NextResponse.json({
      message: `Successfully processed ${operation} operation for ${document._type}`,
      revalidatedPaths,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

