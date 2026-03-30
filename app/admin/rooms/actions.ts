'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/prisma';
import { syncRoomToSanity } from '@/utils/santitySync';

export async function deleteRoomAction(roomId: string) {
  const existingRoom = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      tenants: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  if (!existingRoom) {
    throw new Error('Room not found');
  }

  if (existingRoom.tenants.length > 0) {
    throw new Error(
      'Cannot delete room with active tenants. Please move tenants first.',
    );
  }

  syncRoomToSanity(existingRoom.id, 'delete').catch((error) => {
    console.error('Failed to sync Room delete to Sanity:', error);
  });

  await prisma.room.delete({
    where: { id: existingRoom.id },
  });

  await prisma.pG.update({
    where: { id: existingRoom.pgId },
    data: {
      totalRooms: { decrement: 1 },
      availableRooms:
        existingRoom.availabilityStatus === 'AVAILABLE'
          ? { decrement: 1 }
          : undefined,
    },
  });

  revalidatePath('/admin/rooms');
  revalidatePath('/admin/dashboard');
}

