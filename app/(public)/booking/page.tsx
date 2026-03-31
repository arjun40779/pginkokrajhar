'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CheckCircle,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingValidation } from '@/lib/hooks/useAvailability';
import { formatRoomAvailabilityLabel } from '@/lib/rooms/availability';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (
        event: 'payment.failed',
        callback: (response: { error?: { description?: string } }) => void,
      ) => void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
    email?: string;
  };
  notes?: Record<string, string>;
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
}

interface PGRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  maxOccupancy: number;
  monthlyRent: number;
  securityDeposit: number;
  hasAC: boolean;
  hasAttachedBath: boolean;
  hasBalcony: boolean;
  availabilityStatus: string;
}

interface PGDetails {
  id: string;
  name: string;
  location: {
    area: string;
    city: string;
    state: string;
  };
  ownerPhone: string;
  pricing: {
    minPrice: number;
  };
  rooms: PGRoom[];
}

function loadRazorpayScript() {
  if (globalThis.window?.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get('pgId');
  const roomId = searchParams.get('roomId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pg, setPG] = useState<PGDetails | null>(null);
  const [room, setRoom] = useState<PGRoom | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    checkInDate: '',
    notes: '',
  });

  const { validation, isLoading: validationLoading } = useBookingValidation(
    pgId,
    roomId,
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!pgId) {
        toast.error('PG ID is required');
        router.push('/rooms');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/pg/${pgId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PG details');
        }

        const payload = await response.json();
        if (!payload.success || !payload.data) {
          throw new Error(payload.error || 'Failed to load PG details');
        }

        const pgData = payload.data as PGDetails;
        setPG(pgData);

        if (roomId) {
          const matchedRoom = pgData.rooms.find(
            (candidate) => candidate.id === roomId,
          );
          if (!matchedRoom) {
            throw new Error('Room not found');
          }
          setRoom(matchedRoom);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load booking details',
        );
        router.push('/rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pgId, roomId, router]);

  const monthlyRent =
    validation?.monthlyRent ?? room?.monthlyRent ?? pg?.pricing.minPrice ?? 0;
  const securityDeposit =
    validation?.securityDeposit ?? room?.securityDeposit ?? 0;
  const totalAmount = monthlyRent + securityDeposit;
  const isRoomCheckoutAvailable = roomId
    ? Boolean(validation?.valid)
    : Boolean(pgId);
  const availabilityMessage = validation?.availabilityStatus
    ? formatRoomAvailabilityLabel(validation.availabilityStatus).toLowerCase()
    : null;

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pgId) {
      toast.error('PG ID is required');
      return;
    }

    if (!formData.checkInDate) {
      toast.error('Please select a check-in date');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (roomId && !validationLoading && !validation?.valid) {
      toast.error(
        validation?.reason ?? 'This room is not available for checkout',
      );
      return;
    }

    setSubmitting(true);

    try {
      const checkoutReady = await loadRazorpayScript();
      if (!checkoutReady || !globalThis.window?.Razorpay) {
        throw new Error('Unable to load Razorpay checkout');
      }

      const orderResponse = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgId, roomId: roomId || undefined }),
      });

      const orderPayload = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderPayload.error || 'Failed to create payment order');
      }

      const razorpay = new globalThis.window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.order.amount,
        currency: orderPayload.order.currency,
        name: pg?.name ?? 'PG Booking',
        description: room ? `Room ${room.roomNumber} booking` : 'PG booking',
        order_id: orderPayload.order.id,
        prefill: {
          name: formData.customerName,
          contact: formData.customerPhone,
          email: formData.customerEmail || undefined,
        },
        notes: {
          pgId,
          roomId: roomId || '',
          checkInDate: formData.checkInDate,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              '/api/payments/razorpay/verify',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...formData,
                  pgId,
                  roomId: roomId || undefined,
                  checkInDate: new Date(formData.checkInDate).toISOString(),
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              },
            );

            const bookingPayload = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(
                bookingPayload.error || 'Payment verification failed',
              );
            }

            toast.success('Payment received and booking confirmed');
            router.push(`/booking-confirmation?bookingId=${bookingPayload.id}`);
          } catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            toast.error(
              error instanceof Error
                ? error.message
                : 'Payment succeeded but booking confirmation failed',
            );
          } finally {
            setSubmitting(false);
          }
        },
      });

      razorpay.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed');
        setSubmitting(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Error starting Razorpay checkout:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start checkout',
      );
      setSubmitting(false);
    }
  };

  if (!pgId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Invalid booking request</p>
          <Link href="/rooms">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load PG details</p>
          <Link href="/rooms">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href={`/pg/${pg.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to PG Details
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Complete Checkout
          </h1>
          <p className="text-gray-600">
            Pay securely to confirm your stay at {pg.name}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Guest Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Personal Information
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="customerName">Full Name</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              customerName: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <Input
                          id="customerPhone"
                          value={formData.customerPhone}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              customerPhone: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerEmail">Email Address</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            customerEmail: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Move-in Date
                    </h3>
                    <Input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          checkInDate: event.target.value,
                        }))
                      }
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Any special requirements or questions..."
                    />
                  </div>

                  {roomId && !validationLoading && !isRoomCheckoutAvailable ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Checkout is unavailable because this room is currently{' '}
                      {availabilityMessage ?? 'unavailable'}.
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      validationLoading ||
                      !isRoomCheckoutAvailable
                    }
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting secure checkout...
                      </>
                    ) : (
                      `Pay ₹${totalAmount.toLocaleString()} & Confirm Booking`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{pg.name}</h4>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    {pg.location.area}, {pg.location.city}, {pg.location.state}
                  </div>
                </div>

                {room ? (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      <span className="font-medium">
                        Room {room.roomNumber}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Type: {room.roomType}</p>
                      <p>Floor: {room.floor}</p>
                      <p>Max Occupancy: {room.maxOccupancy}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {pg.ownerPhone}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span>₹{monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span>₹{securityDeposit.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Due Today</span>
                    <span className="text-green-600">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <CheckCircle className="mr-2 inline h-4 w-4 text-green-600" />
                  Payment is collected securely via Razorpay. Your booking is
                  confirmed only after payment verification succeeds.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
