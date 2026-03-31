import { User } from '@supabase/supabase-js';
import { prisma } from '@/prisma';
import { ResidentDashboardResponse } from './dashboard.types';

type AuthUser = Pick<User, 'id' | 'email' | 'user_metadata'>;

type BookingFilter = {
  customerEmail?: string;
  roomId?: string;
};

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
  const mobile =
    typeof metadata.mobile === 'string'
      ? metadata.mobile
      : typeof metadata.phone === 'string'
        ? metadata.phone
        : '';
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

  const pendingAmount = payments
    .filter((payment) => payment.status === 'PENDING')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const lastPayment = payments.find(
    (payment) => payment.status === 'COMPLETED',
  );

  let nextDueDate: Date | number | null = null;

  if (lastPayment) {
    nextDueDate = new Date(
      lastPayment.paymentDate || lastPayment.createdAt,
    ).setMonth(
      new Date(lastPayment.paymentDate || lastPayment.createdAt).getMonth() + 1,
    );
  } else if (tenant) {
    nextDueDate = new Date();
  }

  return toSerializable({
    profile,
    tenant,
    bookings,
    payments,
    pendingAmount,
    nextDueDate,
    monthlyRent: tenant?.rentAmount ?? 0,
    rentStatus: tenant?.rentStatus ?? 'PENDING',
  });
}

