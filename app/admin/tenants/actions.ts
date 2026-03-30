'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/prisma';

export async function deleteTenantAction(tenantId: string) {
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      payments: true,
      room: true,
    },
  });

  if (!existingTenant) {
    throw new Error('Tenant not found');
  }

  if (existingTenant.payments.length > 0) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isActive: false,
        moveOutDate: new Date(),
      },
    });
  } else {
    await prisma.tenant.delete({
      where: { id: tenantId },
    });
  }

  const roomTenants = await prisma.tenant.count({
    where: {
      roomId: existingTenant.roomId,
      isActive: true,
    },
  });

  await prisma.room.update({
    where: { id: existingTenant.roomId },
    data: {
      currentOccupancy: roomTenants,
      availabilityStatus:
        roomTenants === 0
          ? 'AVAILABLE'
          : existingTenant.room.availabilityStatus,
    },
  });

  revalidatePath('/admin/tenants');
  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/tenants/${tenantId}`);
}

