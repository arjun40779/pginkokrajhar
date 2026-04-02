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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { ResidentDashboardResponse } from '@/lib/resident/dashboard.types';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

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

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string | number | null | undefined) {
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

type ResidentDashboardProps = {
  dashboardData: ResidentDashboardResponse;
  viewerEmail: string | null;
};

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
  const recentPayments = dashboardData.payments.slice(0, 5);
  const recentBookings = dashboardData.bookings.slice(0, 6);
  const rentCycle = dashboardData.rentCycle;
  const razorpayGlobal = globalThis as RazorpayGlobal;

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
      const orderResponse = await fetch('/api/user/payments/rent/order', {
        method: 'POST',
        cache: 'no-store',
      });
      const orderPayload = (await orderResponse.json()) as
        | RentOrderResponse
        | { error?: string };

      if (!orderResponse.ok) {
        throw new Error(orderPayload.error || 'Unable to start rent payment');
      }

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
            setPaymentError(
              verifyPayload.error ||
                'Payment was captured but verification failed.',
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.14),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_48%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="flex flex-col gap-5 px-6 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge
                  className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 hover:bg-cyan-50"
                  variant="outline"
                >
                  Resident Dashboard
                </Badge>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {dashboardData.profile?.name ||
                      tenant?.name ||
                      'Your stay, payments, and bookings'}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Review your booking history, pending rent, and current room
                    details in one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="border-slate-300"
                  onClick={() => router.push('/rooms')}
                  variant="outline"
                >
                  Browse Rooms
                </Button>
                <Button onClick={handleSignOut} variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-slate-200 bg-white/90">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Pending Rent
                </CardTitle>
                <CreditCard className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(dashboardData.pendingAmount)}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Current status:{' '}
                  {dashboardData.rentStatus || tenant?.rentStatus || 'PENDING'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Monthly Rent
                </CardTitle>
                <Receipt className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(
                    dashboardData.monthlyRent ||
                      tenant?.rentAmount ||
                      room?.monthlyRent,
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Security deposit: {formatCurrency(room?.securityDeposit)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Current Room
                </CardTitle>
                <BedDouble className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-950">
                  {room ? `Room ${room.roomNumber}` : 'Not assigned'}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {room
                    ? `${room.pg.name} • ${room.roomType}`
                    : 'Booking details will appear here once assigned.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Next Due Date
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-950">
                  {formatDate(dashboardData.nextDueDate)}
                </div>
                {rentCycle ? (
                  <>
                    <p className="mt-1 text-xs text-slate-500">
                      {rentCycle.canPayNow
                        ? `Rent for ${rentCycle.month} is due now.`
                        : `Upcoming cycle: ${rentCycle.month}`}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      disabled={!rentCycle.canPayNow || isPayingRent}
                      onClick={handlePayRent}
                    >
                      {isPayingRent
                        ? 'Starting checkout...'
                        : `Pay ${formatCurrency(rentCycle.amount)}`}
                    </Button>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Keep payments current to avoid overdue charges.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {paymentError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {paymentError}
            </div>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-slate-200 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">
                  Current Stay
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tenant && room ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Resident
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {tenant.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {tenant.phone}
                        </p>
                        <p className="text-sm text-slate-600">
                          {tenant.email || viewerEmail || 'Email not available'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Stay Window
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950">
                          Move in: {formatDate(tenant.moveInDate)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Move out: {formatDate(tenant.moveOutDate)}
                        </p>
                        <Badge
                          className={`mt-3 border ${statusTone(tenant.rentStatus)}`}
                          variant="outline"
                        >
                          {tenant.rentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Room Details
                          </p>
                          <h2 className="mt-2 text-xl font-semibold text-slate-950">
                            {room.pg.name} • Room {room.roomNumber}
                          </h2>
                        </div>
                        <Badge
                          className={`border ${statusTone(tenant.rentStatus)}`}
                          variant="outline"
                        >
                          {room.roomType}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Floor
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-950">
                            {room.floor}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Occupancy
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-950">
                            {room.currentOccupancy}/{room.maxOccupancy}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Rent
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-950">
                            {formatCurrency(room.monthlyRent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Deposit
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-950">
                            {formatCurrency(room.securityDeposit)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-cyan-50 p-4 text-sm text-slate-700">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                        <div>
                          <p className="font-medium text-slate-950">
                            {room.pg.address}
                          </p>
                          <p className="mt-1">
                            {room.pg.area}, {room.pg.city}, {room.pg.state}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            Owner contact: {room.pg.ownerPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
                    No active room assignment found yet. Your confirmed bookings
                    will still appear below.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg text-slate-950">
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments.length > 0 ? (
                  <div className="space-y-3">
                    {recentPayments.map((payment) => (
                      <div
                        className="rounded-2xl border border-slate-200 px-4 py-3"
                        key={payment.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-950">
                              {payment.month}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Due {formatDate(payment.dueDate)}
                            </p>
                          </div>
                          <Badge
                            className={`border ${statusTone(payment.status)}`}
                            variant="outline"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Amount</span>
                          <span className="font-semibold text-slate-950">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                          <span>Paid on</span>
                          <span>
                            {formatDate(
                              payment.paymentDate || payment.createdAt,
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
                    No payment history available yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg text-slate-950">
                Booking History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
                    <span>Property</span>
                    <span>Check In</span>
                    <span>Check Out</span>
                    <span>Room</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {recentBookings.map((booking) => (
                      <div className="px-4 py-3" key={booking.id}>
                        <div className="space-y-3 md:hidden">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {booking.room?.pg.name || booking.customerName}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Booked on {formatDate(booking.createdAt)}
                              </p>
                            </div>
                            <Badge
                              className={`border ${statusTone(booking.status)}`}
                              variant="outline"
                            >
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                            <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-1.5">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                In
                              </p>
                              <p className="font-medium text-slate-950">
                                {formatDate(booking.checkInDate)}
                              </p>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-1.5">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Out
                              </p>
                              <p className="font-medium text-slate-950">
                                {formatDate(booking.checkOutDate)}
                              </p>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-1.5">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Room
                              </p>
                              <p className="font-medium text-slate-950">
                                {booking.room
                                  ? `Room ${booking.room.roomNumber}`
                                  : 'Not assigned'}
                              </p>
                            </div>
                            <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-1.5">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Total
                              </p>
                              <p className="font-medium text-slate-950">
                                {formatCurrency(booking.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500">
                            Paid {formatCurrency(booking.paidAmount)}
                          </p>
                        </div>

                        <div className="hidden items-center gap-4 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_auto]">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {booking.room?.pg.name || booking.customerName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Booked on {formatDate(booking.createdAt)}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-slate-950">
                            {formatDate(booking.checkInDate)}
                          </div>
                          <div className="text-sm font-medium text-slate-950">
                            {formatDate(booking.checkOutDate)}
                          </div>
                          <div className="text-sm font-medium text-slate-950">
                            {booking.room
                              ? `Room ${booking.room.roomNumber}`
                              : 'Not assigned'}
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-slate-950">
                              {formatCurrency(booking.totalAmount)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Paid {formatCurrency(booking.paidAmount)}
                            </p>
                          </div>
                          <div className="justify-self-end">
                            <Badge
                              className={`border ${statusTone(booking.status)}`}
                              variant="outline"
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
                  No booking history found for this account yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ResidentDashboard;

