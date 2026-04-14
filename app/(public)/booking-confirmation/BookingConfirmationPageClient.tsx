'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BedDouble,
  Building2,
  Calendar,
  CheckCircle,
  Copy,
  ExternalLink,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  checkInDate: string;
  checkOutDate?: string;
  monthlyRent: number;
  securityDeposit: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
    ownerPhone: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    roomType: string;
  };
}

interface BookingConfirmationPageClientProps {
  bookingId: string | null;
}

export default function BookingConfirmationPageClient({
  bookingId,
}: Readonly<BookingConfirmationPageClientProps>) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/bookings?id=${bookingId}`);

        if (!response.ok) {
          throw new Error('Booking not found');
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const copyBookingId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      toast.success('Booking ID copied to clipboard');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error || 'Booking not found'}</p>
          <Link href="/pgs">
            <Button>Back to PGs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkInDate);
  const isConfirmedBooking = booking.status === 'CONFIRMED';
  const heading = isConfirmedBooking
    ? 'Booking Confirmed!'
    : 'Booking Received';
  const subheading = isConfirmedBooking
    ? 'Your payment was successful and your booking is confirmed.'
    : 'Your booking request has been submitted successfully';
  const heroTone = isConfirmedBooking ? 'bg-green-100' : 'bg-yellow-100';
  const heroIconTone = isConfirmedBooking
    ? 'text-green-600'
    : 'text-yellow-600';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${heroTone}`}
          >
            <CheckCircle className={`h-10 w-10 ${heroIconTone}`} />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{heading}</h1>
          <p className="text-gray-600">{subheading}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking Details</CardTitle>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(booking.status)}`}
                  >
                    {booking.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Booking ID
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                        {booking.id}
                      </span>
                      <Button variant="ghost" size="sm" onClick={copyBookingId}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Booking Date
                    </p>
                    <p className="mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Customer Name
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{booking.customerName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Phone Number
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {booking.customerEmail ? (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Email Address
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{booking.customerEmail}</span>
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Check-in Date
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{checkInDate.toDateString()}</span>
                  </div>
                </div>

                {booking.notes ? (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Additional Notes
                    </p>
                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-800">
                      {booking.notes}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">
                    {booking.pg.name}
                  </h4>
                  <div className="mb-4 flex items-center text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>
                      {booking.pg.area}, {booking.pg.city}
                    </span>
                  </div>
                </div>

                {booking.room ? (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      <span className="font-medium">
                        Room {booking.room.roomNumber}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Type: {booking.room.roomType}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>Owner: {booking.pg.ownerPhone}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Verification Call
                      </h4>
                      <p className="text-sm text-gray-600">
                        You'll receive a call from the property owner within 24
                        hours to confirm your booking.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Documentation
                      </h4>
                      <p className="text-sm text-gray-600">
                        Prepare your ID proof and recent photographs for the
                        verification process.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Payment & Move-in
                      </h4>
                      <p className="text-sm text-gray-600">
                        Complete the payment process and schedule your move-in
                        date.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span>₹{booking.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span>₹{booking.securityDeposit.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Paid Amount:</span>
                    <span
                      className={
                        booking.paidAmount > 0
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }
                    >
                      ₹{booking.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  {booking.paidAmount < booking.totalAmount ? (
                    <div className="flex justify-between text-sm font-medium text-orange-600">
                      <span>Pending:</span>
                      <span>
                        ₹
                        {(
                          booking.totalAmount - booking.paidAmount
                        ).toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Owner
                </Button>
                <Link href={`/pg/${booking.pg.id}`} className="block">
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Property
                  </Button>
                </Link>
                <Link href="/pgs" className="block">
                  <Button variant="outline" className="w-full" size="sm">
                    Browse More PGs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  If you have any questions about your booking, feel free to
                  reach out to us.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>+91 9876543210</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>support@pgmanagement.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

