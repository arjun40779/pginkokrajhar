import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';

const inquiryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.email().optional().or(z.literal('')),
  message: z.string().optional(),
  pgId: z.uuid('Valid PG ID is required'),
  roomId: z.uuid().optional(),
  source: z.string().default('website'),
});

// POST /api/inquiries - Create new inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inquiryCreateSchema.parse(body);

    // Check if PG exists
    const pg = await prisma.pG.findUnique({
      where: { id: validatedData.pgId },
      select: { id: true, name: true },
    });

    if (!pg) {
      return NextResponse.json({ error: 'PG not found' }, { status: 404 });
    }

    // Check if room exists (if provided)
    if (validatedData.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: validatedData.roomId },
        select: { id: true, roomNumber: true },
      });

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || null,
        message: validatedData.message || null,
        pgId: validatedData.pgId,
        source: validatedData.source,
        status: 'NEW',
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 },
    );
  }
}

// GET /api/inquiries - List inquiries (admin only - placeholder)
export async function GET(request: NextRequest) {
  // This would typically require authentication
  // For now, return a placeholder response
  return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
}

