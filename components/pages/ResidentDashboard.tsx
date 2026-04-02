'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BedDouble,
  CalendarDays,
  CreditCard,
  LogOut,
  MapPin,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { ResidentDashboardResponse } from '@/lib/resident/dashboard.types';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type DisplayValue = number | string | null | undefined;

type RentOrderResponse = {
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  payment: {
    id: string;
    amount: number;
    dueDate: string;
    month: string;
  };
  tenant: {
    name: string;
    email: string | null;
    phone: string;
  };
};

function isRentOrderResponse(
  payload: RentOrderResponse | { error?: string },
): payload is RentOrderResponse {
  return (
    'keyId' in payload &&
    'order' in payload &&
    'payment' in payload &&
    'tenant' in payload
  );
}

type RazorpayGlobal = typeof globalThis & {
  Razorpay?: Window['Razorpay'];
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
      modal?: {
        ondismiss?: () => void;
      };
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      theme?: {
        color?: string;
      };
    }) => { open: () => void };
  }
}

function formatCurrency(value: DisplayValue) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: DisplayValue) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusTone(status: string) {
  switch (status) {
    case 'PAID':
    case 'COMPLETED':
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'OVERDUE':
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
}

function getRentCycleBadgeLabel(status: 'PENDING' | 'OVERDUE' | 'UPCOMING') {
  return status === 'UPCOMING' ? 'Upcoming' : status;
}

function getRentCycleDescription(
  rentCycle: ResidentDashboardResponse['rentCycle'],
) {
  if (!rentCycle) {
    return 'Keep payments current to avoid overdue charges.';
  }

  if (rentCycle.status === 'UPCOMING') {
    return `Payment opens on ${formatDate(rentCycle.dueDate)}.`;
  }

  if (rentCycle.status === 'OVERDUE') {
    return `${rentCycle.month} rent is overdue.`;
  }

  return `${rentCycle.month} rent is pending.`;
}

function formatPaymentMonth(value: DisplayValue) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function isPaidBooking(booking: DashboardBooking) {
  return (
    (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') &&
    Number(booking.paidAmount) > 0
  );
}

function buildRecentPaymentRows(
  payments: DashboardPayment[],
  bookings: DashboardBooking[],
) {
  const paidBookingByMonth = new Map<string, DashboardBooking>();

  bookings.forEach((booking) => {
    if (!isPaidBooking(booking)) {
      return;
    }

    const month = formatPaymentMonth(booking.checkInDate);
    const existing = paidBookingByMonth.get(month);

    if (!existing) {
      paidBookingByMonth.set(month, booking);
      return;
    }

    if (
      new Date(booking.createdAt).getTime() >
      new Date(existing.createdAt).getTime()
    ) {
      paidBookingByMonth.set(month, booking);
    }
  });

  const normalizedPayments = payments.map((payment) => {
    const paidBooking = paidBookingByMonth.get(payment.month);

    if (
      paidBooking &&
      (payment.status === 'PENDING' || payment.status === 'FAILED')
    ) {
      return {
        ...payment,
        status: 'COMPLETED' as const,
        paymentDate: paidBooking.createdAt,
      };
    }

    return payment;
  });

  const existingMonths = new Set(
    normalizedPayments.map((payment) => payment.month),
  );
  const syntheticPayments = [...paidBookingByMonth.entries()]
    .filter(([month]) => !existingMonths.has(month))
    .map(([month, booking]) => ({
      id: `booking-${booking.id}`,
      amount: booking.paidAmount,
      status: 'COMPLETED' as const,
      paymentDate: booking.createdAt,
      dueDate: booking.checkInDate,
      month,
      createdAt: booking.createdAt,
    }));

  return [...normalizedPayments, ...syntheticPayments]
    .filter((payment) => payment.status === 'COMPLETED')
    .sort(
      (left, right) =>
        new Date(right.paymentDate || right.createdAt).getTime() -
        new Date(left.paymentDate || left.createdAt).getTime(),
    )
    .slice(0, 5);
}

async function createRentOrder() {
  const orderResponse = await fetch('/api/user/payments/rent/order', {
    method: 'POST',
    cache: 'no-store',
  });
  const orderPayload = (await orderResponse.json()) as
    | RentOrderResponse
    | { error?: string };

  const rentOrderPayload = isRentOrderResponse(orderPayload)
    ? orderPayload
    : null;
  const orderErrorMessage =
    rentOrderPayload === null && 'error' in orderPayload
      ? orderPayload.error
      : undefined;

  if (!orderResponse.ok || !rentOrderPayload) {
    throw new Error(orderErrorMessage || 'Unable to start rent payment');
  }

  return rentOrderPayload;
}

async function verifyRentPayment(
  orderPayload: RentOrderResponse,
  response: RazorpaySuccessResponse,
) {
  const verifyResponse = await fetch('/api/user/payments/rent/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentId: orderPayload.payment.id,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    }),
  });

  const verifyPayload = (await verifyResponse.json()) as {
    error?: string;
  };

  if (!verifyResponse.ok) {
    throw new Error(
      verifyPayload.error || 'Payment was captured but verification failed.',
    );
  }
}

type ResidentDashboardProps = {
  dashboardData: ResidentDashboardResponse;
  viewerEmail: string | null;
};

type DashboardTenant = NonNullable<ResidentDashboardResponse['tenant']>;
type DashboardRoom = NonNullable<DashboardTenant['room']>;
type DashboardPayment = ResidentDashboardResponse['payments'][number];
type DashboardBooking = ResidentDashboardResponse['bookings'][number];

type DashboardHeaderProps = {
  onSignOut: () => Promise<void>;
};

type HeroSectionProps = {
  residentName: string;
  onBrowseRooms: () => void;
  onSignOut: () => Promise<void>;
};

function HeroSection({
  residentName,
  onBrowseRooms,
  onSignOut,
}: Readonly<HeroSectionProps>) {
  return (
    <section className="mb-4 rounded-[12px] bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-600 p-5 shadow-lg shadow-sky-200/70 sm:mb-8 sm:p-7">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {residentName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-sky-50 sm:text-base">
            Review your booking history, pending rent, and current room details
            in one place.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
          <Button
            className="flex-1 rounded-xl border-0 bg-white/20 text-white hover:bg-white/30 sm:flex-none"
            onClick={onBrowseRooms}
            variant="secondary"
          >
            Browse Rooms
          </Button>
          <Button
            className="flex-1 rounded-xl border-0 bg-white text-sky-700 shadow-lg hover:bg-slate-50 sm:flex-none"
            onClick={onSignOut}
            variant="secondary"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </section>
  );
}

type OverviewCardsProps = {
  currentRoomLabel: string;
  currentRoomMeta: string;
  dashboardData: ResidentDashboardResponse;
  dueBadgeTone: string;
  dueStatus: string | null;
  isPayingRent: boolean;
  onPayRent: () => Promise<void>;
  pendingBadgeTone: string;
  pendingRentCaption: string;
  rentCycle: ResidentDashboardResponse['rentCycle'];
  tenant: ResidentDashboardResponse['tenant'];
};

function OverviewCards({
  currentRoomLabel,
  currentRoomMeta,
  dashboardData,
  dueBadgeTone,
  dueStatus,
  isPayingRent,
  onPayRent,
  pendingBadgeTone,
  pendingRentCaption,
  rentCycle,
  tenant,
}: Readonly<OverviewCardsProps>) {
  return (
    <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:mb-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Pending Rent
          </span>
          <CreditCard className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-3xl font-bold text-slate-950">
          {formatCurrency(dashboardData.pendingAmount)}
        </div>
        <div
          className={`mt-3 inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${pendingBadgeTone}`}
        >
          {pendingRentCaption}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Monthly Rent
          </span>
          <Receipt className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-3xl font-bold text-slate-950">
          {formatCurrency(
            dashboardData.monthlyRent ||
              tenant?.rentAmount ||
              tenant?.room?.monthlyRent,
          )}
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Deposit: {formatCurrency(tenant?.room?.securityDeposit)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Current Room
          </span>
          <BedDouble className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-3xl font-bold text-slate-950">
          {currentRoomLabel}
        </div>
        <div className="mt-3 text-xs text-slate-500">{currentRoomMeta}</div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Next Due Date
          </span>
          <CalendarDays className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-3xl font-bold text-slate-950">
          {formatDate(dashboardData.nextDueDate)}
        </div>

        {rentCycle ? (
          <>
            <div
              className={`mt-3 inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${dueBadgeTone}`}
            >
              {rentCycle.month} ({dueStatus})
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {getRentCycleDescription(rentCycle)}
            </p>
            {rentCycle.canPayNow ? (
              <Button
                className="mt-3 w-full rounded-xl border-0 bg-gradient-to-r from-sky-600 to-cyan-600 font-semibold text-white hover:from-sky-700 hover:to-cyan-700"
                disabled={isPayingRent}
                onClick={onPayRent}
              >
                {isPayingRent
                  ? 'Starting checkout...'
                  : `Pay ${formatCurrency(rentCycle.amount)}`}
              </Button>
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Keep payments current to avoid overdue charges.
          </p>
        )}
      </div>
    </section>
  );
}

type CurrentStaySectionProps = {
  dueDay: number | null;
  room: DashboardRoom | null | undefined;
  tenant: DashboardTenant | null | undefined;
  viewerEmail: string | null;
};

function CurrentStaySection({
  dueDay,
  room,
  tenant,
  viewerEmail,
}: Readonly<CurrentStaySectionProps>) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Current Stay
      </h2>

      {tenant && room ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-sky-50 to-cyan-50 p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 text-xs font-medium text-sky-700">
                  RESIDENT
                </div>
                <div className="font-semibold text-slate-900">
                  {tenant.name}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="mb-1 text-xs text-slate-500">STAY IN ROOM</div>
                <div className="font-semibold text-slate-900">
                  Move in: {formatDate(tenant.moveInDate)}
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-600 break-all">
              {tenant.email || viewerEmail || 'Email not available'}
              {' • '}
              {tenant.phone}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Room Details
              </div>
              <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                {room.roomType}
              </span>
            </div>

            <div className="mb-2 font-semibold text-slate-900">
              {room.pg.name} • Room {room.roomNumber}
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-slate-500">CHECK-IN</div>
                <div className="font-medium text-slate-900">
                  {formatDate(tenant.moveInDate)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">DUE DATE</div>
                <div className="font-medium text-slate-900">
                  {dueDay ?? 'NA'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">DEPOSIT</div>
                <div className="font-medium text-slate-900">
                  {formatCurrency(room.securityDeposit)}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {room.pg.area}, {room.pg.city}, {room.pg.state}
                </span>
              </div>
              <div className="text-xs text-slate-500 break-words">
                {room.pg.address}
              </div>
              <div className="mt-1 text-xs text-sky-700 break-all">
                Owner contact: {room.pg.ownerPhone}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
          No active room assignment found yet. Your confirmed bookings will
          still appear below.
        </div>
      )}
    </div>
  );
}

type RecentPaymentsSectionProps = {
  recentPayments: DashboardPayment[];
};

function RecentPaymentsSection({
  recentPayments,
}: Readonly<RecentPaymentsSectionProps>) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Recent Payments
      </h2>

      {recentPayments.length > 0 ? (
        <div className="space-y-3">
          {recentPayments.map((payment) => (
            <div
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 sm:p-4"
              key={payment.id}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 sm:text-base">
                    {payment.month}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Paid on {formatDate(payment.paymentDate || payment.createdAt)}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-semibold text-slate-900 sm:text-base">
                  {formatCurrency(payment.amount)}
                </div>
                <div className="hidden text-xs text-slate-500 sm:block">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    Paid
                  </span>{' '}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
          No payment history available yet.
        </div>
      )}
    </div>
  );
}

type BookingHistorySectionProps = {
  recentBookings: DashboardBooking[];
};

function BookingHistorySection({
  recentBookings,
}: Readonly<BookingHistorySectionProps>) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Booking History
      </h2>

      {recentBookings.length > 0 ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pr-3 text-left text-xs font-medium uppercase tracking-[0.16em] text-slate-500 whitespace-nowrap">
                    Property
                  </th>
                  <th className="px-3 pb-3 text-left text-xs font-medium uppercase tracking-[0.16em] text-slate-500 whitespace-nowrap">
                    Check In
                  </th>
                  <th className="hidden px-3 pb-3 text-left text-xs font-medium uppercase tracking-[0.16em] text-slate-500 whitespace-nowrap sm:table-cell">
                    Check Out
                  </th>
                  <th className="px-3 pb-3 text-left text-xs font-medium uppercase tracking-[0.16em] text-slate-500 whitespace-nowrap">
                    Room
                  </th>
                  <th className="px-3 pb-3 text-right text-xs font-medium uppercase tracking-[0.16em] text-slate-500 whitespace-nowrap">
                    Amount
                  </th>
                  <th className="pb-3 pl-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-500 whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    key={booking.id}
                  >
                    <td className="py-3 pr-3 text-xs font-medium text-slate-900 sm:py-4 sm:text-sm">
                      {booking.room?.pg.name || booking.customerName}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap sm:py-4 sm:text-sm">
                      {formatDate(booking.checkInDate)}
                    </td>
                    <td className="hidden px-3 py-3 text-xs text-slate-600 whitespace-nowrap sm:table-cell sm:py-4 sm:text-sm">
                      {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-900 whitespace-nowrap sm:py-4 sm:text-sm">
                      {booking.room
                        ? `Room ${booking.room.roomNumber}`
                        : 'Not assigned'}
                    </td>
                    <td className="px-3 py-3 text-right sm:py-4">
                      <div className="text-xs font-semibold text-slate-900 whitespace-nowrap sm:text-sm">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      <div className="hidden text-xs text-slate-500 sm:block">
                        Paid {formatCurrency(booking.paidAmount)}
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-center sm:py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusTone(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
          No booking history found for this account yet.
        </div>
      )}
    </section>
  );
}

export function ResidentDashboard({
  dashboardData,
  viewerEmail,
}: Readonly<ResidentDashboardProps>) {
  const router = useRouter();
  const supabase = createClient();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPayingRent, setIsPayingRent] = useState(false);

  const tenant = dashboardData.tenant;
  const room = tenant?.room;
  const recentBookings = dashboardData.bookings.slice(0, 6);
  const recentPayments = buildRecentPaymentRows(
    dashboardData.payments,
    dashboardData.bookings,
  );
  const currentRentPeriod = dashboardData.currentRentPeriod;
  const rentCycle = dashboardData.rentCycle;
  const razorpayGlobal = globalThis as RazorpayGlobal;
  const pendingRentAmount = Number(dashboardData.pendingAmount ?? 0);
  const residentName =
    dashboardData.profile?.name || tenant?.name || 'Your resident dashboard';
  const dueDate = dashboardData.nextDueDate
    ? new Date(dashboardData.nextDueDate)
    : null;
  const dueDay =
    dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.getDate() : null;
  const dueStatus = rentCycle
    ? getRentCycleBadgeLabel(rentCycle.status).toUpperCase()
    : null;
  const dueBadgeTone = rentCycle
    ? statusTone(rentCycle.status)
    : statusTone('PENDING');
  const pendingBadgeTone =
    pendingRentAmount > 0
      ? statusTone(rentCycle?.status || 'PENDING')
      : statusTone('PAID');
  const currentRoomLabel = room ? `Room ${room.roomNumber}` : 'Not assigned';
  const currentRoomMeta = room
    ? `${room.pg.name} • ${room.roomType}`
    : 'Booking details appear once a room is assigned';

  let pendingRentCaption = 'No active rent due right now.';

  if (pendingRentAmount > 0 && rentCycle) {
    pendingRentCaption = `${rentCycle.month} payable now`;
  } else if (currentRentPeriod?.status === 'PAID') {
    pendingRentCaption = `${currentRentPeriod.month} settled`;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handlePayRent = async () => {
    if (!tenant || !rentCycle?.canPayNow) {
      return;
    }

    setIsPayingRent(true);
    setPaymentError(null);

    try {
      const orderPayload = await createRentOrder();

      if (!razorpayGlobal.Razorpay) {
        throw new Error(
          'Payment checkout failed to load. Refresh and try again.',
        );
      }

      const checkout = new razorpayGlobal.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.order.amount,
        currency: orderPayload.order.currency,
        name: 'PG Inkokrajhar',
        description: `Rent payment for ${orderPayload.payment.month}`,
        order_id: orderPayload.order.id,
        prefill: {
          name: orderPayload.tenant.name,
          email: orderPayload.tenant.email || viewerEmail || undefined,
          contact: orderPayload.tenant.phone,
        },
        theme: {
          color: '#0891b2',
        },
        modal: {
          ondismiss: () => {
            setIsPayingRent(false);
          },
        },
        handler: async (response) => {
          try {
            await verifyRentPayment(orderPayload, response);
          } catch (error) {
            setPaymentError(
              error instanceof Error
                ? error.message
                : 'Payment was captured but verification failed.',
            );
            setIsPayingRent(false);
            return;
          }

          setIsPayingRent(false);
          router.refresh();
        },
      });

      checkout.open();
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Unable to complete payment',
      );
      setIsPayingRent(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
          <HeroSection
            onBrowseRooms={() => router.push('/rooms')}
            onSignOut={handleSignOut}
            residentName={residentName}
          />

          {paymentError ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mb-6">
              {paymentError}
            </div>
          ) : null}

          <OverviewCards
            currentRoomLabel={currentRoomLabel}
            currentRoomMeta={currentRoomMeta}
            dashboardData={dashboardData}
            dueBadgeTone={dueBadgeTone}
            dueStatus={dueStatus}
            isPayingRent={isPayingRent}
            onPayRent={handlePayRent}
            pendingBadgeTone={pendingBadgeTone}
            pendingRentCaption={pendingRentCaption}
            rentCycle={rentCycle}
            tenant={tenant}
          />

          <section className="mb-4 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
            <CurrentStaySection
              dueDay={dueDay}
              room={room}
              tenant={tenant}
              viewerEmail={viewerEmail}
            />
            <RecentPaymentsSection recentPayments={recentPayments} />
          </section>

          <BookingHistorySection recentBookings={recentBookings} />
        </main>
      </div>
    </>
  );
}

export default ResidentDashboard;

