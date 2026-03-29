import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';

const inquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']).optional(),
});

// PUT /api/admin/inquiries/[id] - Update inquiry status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const validatedData = inquiryUpdateSchema.parse(body);

    const existing = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        pg: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/inquiries/[id] - Delete inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const existing = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    await prisma.inquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 },
    );
  }
}
