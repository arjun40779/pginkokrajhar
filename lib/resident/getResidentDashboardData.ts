import { User } from '@supabase/supabase-js';
import { prisma } from '@/prisma';
import { ResidentDashboardResponse } from './dashboard.types';
import { getResidentRentPaymentState } from './rentPaymentState';

type AuthUser = Pick<User, 'id' | 'email' | 'user_metadata'>;

type BookingFilter = {
  customerEmail?: string;
  roomId?: string;
};

function toSerializable<T>(value: T): T {
  const serialized = JSON.stringify(value);
  return structuredClone(JSON.parse(serialized) as T);
}

async function getOrCreateProfile(authUser: AuthUser) {
  const existingProfile = await prisma.user.findUnique({
    where: {
      id: authUser.id,
    },
  });

  if (existingProfile) {
    return existingProfile;
  }

  const metadata = (authUser.user_metadata || {}) as Record<string, unknown>;
  let mobile = '';

  if (typeof metadata.mobile === 'string') {
    mobile = metadata.mobile;
  } else if (typeof metadata.phone === 'string') {
    mobile = metadata.phone;
  }

  const name =
    typeof metadata.name === 'string' ? metadata.name : authUser.email || null;

  return prisma.user.create({
    data: {
      id: authUser.id,
      name,
      mobile,
      email: authUser.email,
      role: 'TENANT',
    },
  });
}

export async function getResidentDashboardData(
  authUser: AuthUser,
): Promise<ResidentDashboardResponse> {
  const profile = await getOrCreateProfile(authUser);

  const tenant = await prisma.tenant.findFirst({
    where: {
      userId: authUser.id,
      isActive: true,
    },
    include: {
      room: {
        include: {
          pg: true,
        },
      },
    },
  });

  const bookingFilters: BookingFilter[] = [];

  if (authUser.email) {
    bookingFilters.push({ customerEmail: authUser.email });
  }

  if (tenant?.roomId) {
    bookingFilters.push({ roomId: tenant.roomId });
  }

  const bookingsPromise =
    bookingFilters.length > 0
      ? prisma.booking.findMany({
          where: {
            OR: bookingFilters,
          },
          include: {
            room: {
              include: {
                pg: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : Promise.resolve([]);

  const paymentsPromise = tenant
    ? prisma.payment.findMany({
        where: {
          tenantId: tenant.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    : Promise.resolve([]);

  const [bookings, payments] = await Promise.all([
    bookingsPromise,
    paymentsPromise,
  ]);

  const rentState = getResidentRentPaymentState(
    tenant
      ? {
          moveInDate: tenant.moveInDate,
          rentAmount: tenant.rentAmount,
        }
      : null,
    payments,
  );

  return toSerializable({
    profile,
    tenant,
    bookings,
    payments,
    pendingAmount: rentState.pendingAmount,
    nextDueDate: rentState.nextDueDate,
    monthlyRent: tenant?.rentAmount ?? 0,
    rentStatus: rentState.rentStatus,
    rentCycle: rentState.currentCycle,
  });
}

