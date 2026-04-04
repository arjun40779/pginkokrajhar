'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
}

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (
  options: RazorpayCheckoutOptions,
) => RazorpayInstance;

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

interface BookingPageClientProps {
  initialPgId: string | null;
  initialRoomId: string | null;
}

export default function BookingPageClient({
  initialPgId,
  initialRoomId,
}: Readonly<BookingPageClientProps>) {
  const router = useRouter();
  const pgId = initialPgId;
  const roomId = initialRoomId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
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
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]',
    );

    if (existingScript) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => {
      setRazorpayReady(false);
      toast.error('Unable to load the payment gateway');
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!pgId) {
        toast.error('PG ID is required');
        router.push('/pgs');
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
        router.push('/pgs');
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

  const handlePaymentCheckout = async (event: React.FormEvent) => {
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

    if (!razorpayReady) {
      toast.error('Payment gateway is still loading. Please try again.');
      return;
    }

    setSubmitting(true);

    try {
      const orderResponse = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgId,
          roomId: roomId || undefined,
        }),
      });

      const orderPayload = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderPayload.error || 'Failed to start payment');
      }

      const Razorpay = (
        globalThis as typeof globalThis & { Razorpay?: RazorpayConstructor }
      ).Razorpay;

      if (!Razorpay) {
        throw new Error('Payment gateway is unavailable right now');
      }

      const paymentModal = new Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.order.amount,
        currency: orderPayload.order.currency,
        name: pg?.name ?? 'PG Booking',
        description: room
          ? `Room ${room.roomNumber} booking`
          : 'PG booking payment',
        order_id: orderPayload.order.id,
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail || undefined,
          contact: formData.customerPhone,
        },
        notes: {
          pgId,
          roomId: roomId || '',
          checkInDate: formData.checkInDate,
        },
        theme: {
          color: '#111827',
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              '/api/payments/razorpay/verify',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customerName: formData.customerName,
                  customerPhone: formData.customerPhone,
                  customerEmail: formData.customerEmail || '',
                  pgId,
                  roomId: roomId || undefined,
                  checkInDate: new Date(formData.checkInDate).toISOString(),
                  notes: formData.notes,
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature,
                }),
              },
            );

            const verifyPayload = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(
                verifyPayload.error || 'Payment verification failed',
              );
            }

            toast.success('Payment successful. Booking confirmed.');
            router.push(`/booking-confirmation?bookingId=${verifyPayload.id}`);
          } catch (error) {
            console.error('Error verifying payment:', error);
            toast.error(
              error instanceof Error
                ? error.message
                : 'Payment verification failed',
            );
            setSubmitting(false);
          }
        },
      });

      paymentModal.open();
    } catch (error) {
      console.error('Error starting live checkout:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start payment',
      );
      setSubmitting(false);
    }
  };

  if (!pgId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Invalid booking request</p>
          <Link href="/pgs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to PGs
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
          <Link href="/pgs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to PGs
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
            Complete your booking securely and pay the move-in amount online.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Guest Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentCheckout} className="space-y-6">
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

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={
                        submitting ||
                        validationLoading ||
                        !isRoomCheckoutAvailable ||
                        !razorpayReady
                      }
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting secure payment...
                        </>
                      ) : (
                        `Proceed to Payment`
                      )}
                    </Button>
                  </div>
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
                      <p>Occupancy: {room.maxOccupancy} person(s)</p>
                    </div>
                  </div>
                ) : null}

                <div className="border-t pt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-medium">
                      ₹{monthlyRent.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-medium">
                      ₹{securityDeposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                    <span>Total Due Today</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="mb-2 flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Secure online checkout
                  </div>
                  <p>
                    Your payment will open in Razorpay. The booking is confirmed
                    only after the payment is verified successfully.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  Need help? Call {pg.ownerPhone}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IndianRupee className="h-4 w-4" />
                  Today&apos;s payment includes the first month&apos;s rent and
                  the security deposit.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

