'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  BedDouble,
  Building2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
    floor: number;
  };
}

const BookingConfirmationPage = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
          <Link href="/rooms">
            <Button>Back to Rooms</Button>
          </Link>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkInDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your booking request has been submitted successfully
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between\">
                  <CardTitle>Booking Details</CardTitle>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                  >
                    {booking.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Booking ID
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Customer Name
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{booking.customerName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Phone Number
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {booking.customerEmail && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Email Address
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{booking.customerEmail}</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Check-in Date
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{checkInDate.toDateString()}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Additional Notes
                    </p>
                    <p className="mt-1 text-gray-800 bg-gray-50 rounded-lg p-3">
                      {booking.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property & Room Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {booking.pg.name}
                  </h4>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {booking.pg.area}, {booking.pg.city}
                    </span>
                  </div>
                </div>

                {booking.room && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BedDouble className="h-4 w-4" />
                      <span className="font-medium">
                        Room {booking.room.roomNumber}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Type: {booking.room.roomType}</p>
                      <p>Floor: {booking.room.floor}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>Owner: {booking.pg.ownerPhone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
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
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
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
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
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
          {/* Sidebar */}
          <div className="space-y-60">
            {/* Payment Summary */}
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
                    <span>\u20b9{booking.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span>
                      \u20b9{booking.securityDeposit.toLocaleString()}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      \u20b9{booking.totalAmount.toLocaleString()}
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
                      {' '}
                      \u20b9{booking.paidAmount.toLocaleString()}{' '}
                    </span>{' '}
                  </div>{' '}
                  {booking.paidAmount < booking.totalAmount && (
                    <div className="flex justify-between text-sm font-medium text-orange-600">
                      {' '}
                      <span>Pending:</span>{' '}
                      <span>
                        \u20b9
                        {(
                          booking.totalAmount - booking.paidAmount
                        ).toLocaleString()}
                      </span>{' '}
                    </div>
                  )}{' '}
                </div>{' '}
              </CardContent>{' '}
            </Card>{' '}
            {/* Quick Actions */}{' '}
            <Card>
              {' '}
              <CardHeader>
                {' '}
                <CardTitle>Quick Actions</CardTitle>{' '}
              </CardHeader>{' '}
              <CardContent className="space-y-3">
                {' '}
                <Button className="w-full" size="sm">
                  {' '}
                  <Phone className="h-4 w-4 mr-2" /> Call Owner{' '}
                </Button>{' '}
                <Link href={`/pg/${booking.pg.id}`} className="block">
                  {' '}
                  <Button variant="outline" className="w-full" size="sm">
                    {' '}
                    <ExternalLink className="h-4 w-4 mr-2" /> View Property{' '}
                  </Button>{' '}
                </Link>{' '}
                <Link href="/rooms" className="block">
                  {' '}
                  <Button variant="outline" className="w-full" size="sm">
                    {' '}
                    Browse More PGs{' '}
                  </Button>{' '}
                </Link>{' '}
              </CardContent>{' '}
            </Card>{' '}
            {/* Support */}{' '}
            <Card>
              {' '}
              <CardHeader>
                {' '}
                <CardTitle>Need Support?</CardTitle>{' '}
              </CardHeader>{' '}
              <CardContent>
                {' '}
                <p className="text-sm text-gray-600 mb-4">
                  {' '}
                  If you have any questions about your booking, feel free to
                  reach out to us.{' '}
                </p>{' '}
                <div className="space-y-2 text-sm">
                  {' '}
                  <div className="flex items-center gap-2">
                    {' '}
                    <Phone className="h-4 w-4 text-gray-400" />{' '}
                    <span>+91 9876543210</span>{' '}
                  </div>{' '}
                  <div className="flex items-center gap-2">
                    {' '}
                    <Mail className="h-4 w-4 text-gray-400" />{' '}
                    <span>support@pgmanagement.com</span>{' '}
                  </div>{' '}
                </div>{' '}
              </CardContent>{' '}
            </Card>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
};

export default BookingConfirmationPage;
