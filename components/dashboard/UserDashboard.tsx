'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Home,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  IndianRupee,
  Clock,
} from 'lucide-react';

interface TenantData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  rentAmount: number;
  rentStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  moveInDate: string;
  room: {
    roomNumber: string;
    roomType: string;
    pg: {
      name: string;
      address: string;
      ownerPhone: string;
    };
  };
}

interface BookingData {
  id: string;
  status: string;
  checkInDate: string;
  checkOutDate?: string;
  monthlyRent: number;
  totalAmount: number;
  paidAmount: number;
  room?: {
    roomNumber: string;
    pg: {
      name: string;
    };
  };
}

interface PaymentData {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentDate?: string;
  createdAt: string;
  paymentType: string;
}

export default function UserDashboard() {
  const { user, userProfile } = useAuth();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [paymentSummary, setPaymentSummary] = useState({
    pendingAmount: 0,
    nextDueDate: null as Date | null,
    monthlyRent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch bookings and tenant data
        const bookingsResponse = await fetch('/api/user/bookings');
        const bookingsData = await bookingsResponse.json();

        if (bookingsData.tenant) {
          setTenant(bookingsData.tenant);
        }
        setBookings(bookingsData.bookings || []);

        // Fetch payments data
        const paymentsResponse = await fetch('/api/user/payments');
        const paymentsData = await paymentsResponse.json();

        setPayments(paymentsData.payments || []);
        setPaymentSummary({
          pendingAmount: paymentsData.pendingAmount || 0,
          nextDueDate: paymentsData.nextDueDate
            ? new Date(paymentsData.nextDueDate)
            : null,
          monthlyRent: paymentsData.monthlyRent || 0,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      FAILED: 'bg-red-100 text-red-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold">{userProfile?.name || user?.email}</p>
        </div>
      </div>

      {/* Current Accommodation */}
      {tenant ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Current Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{tenant.room.pg.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tenant.room.pg.address}
                </p>
                <p className="text-sm flex items-center gap-1 mt-1">
                  <Phone className="h-4 w-4" />
                  {tenant.room.pg.ownerPhone}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Room:</strong> {tenant.room.roomNumber} (
                  {tenant.room.roomType})
                </p>
                <p className="text-sm">
                  <strong>Monthly Rent:</strong> ₹{tenant.rentAmount}
                </p>
                <p className="text-sm">
                  <strong>Move-in Date:</strong>{' '}
                  {new Date(tenant.moveInDate).toLocaleDateString()}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Rent Status:</strong>{' '}
                  {getStatusBadge(tenant.rentStatus)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertDescription>
            You don't have any active accommodation. Browse available rooms to
            book one.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5" />
              {paymentSummary.monthlyRent}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center">
              <IndianRupee className="h-5 w-5" />
              {paymentSummary.pendingAmount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {paymentSummary.nextDueDate
                ? paymentSummary.nextDueDate.toLocaleDateString()
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </CardTitle>
          <CardDescription>Your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">₹{payment.amount}</p>
                    <p className="text-sm text-gray-600">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payment.status)}
                    <p className="text-sm text-gray-600 mt-1">
                      {payment.paymentType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No payments found</p>
          )}
        </CardContent>
      </Card>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Booking History
          </CardTitle>
          <CardDescription>Your booking history</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {booking.room?.pg.name} - Room{' '}
                        {booking.room?.roomNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Check-in:{' '}
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </p>
                      {booking.checkOutDate && (
                        <p className="text-sm text-gray-600">
                          Check-out:{' '}
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{booking.totalAmount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Paid: ₹{booking.paidAmount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No bookings found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
