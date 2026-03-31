'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  BedDouble,
  IndianRupee,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  pg?: {
    id: string;
    name: string;
    area: string;
    city: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    roomType: string;
  };
}

const statusConfig = {
  PENDING: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    label: 'Pending',
  },
  CONFIRMED: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Confirmed',
  },
  CANCELLED: {
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    label: 'Cancelled',
  },
  COMPLETED: {
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    label: 'Completed',
  },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      setBookings(data.bookings || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Bookings</h2>
        <p className="text-gray-500 mt-1">
          Manage booking requests and reservations across your properties
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-gray-200 bg-gray-50 pl-10"
              />
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                >
                  {status === 'all'
                    ? 'All'
                    : statusConfig[status as keyof typeof statusConfig].label}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {loading && (
        <div className="space-y-4">
          {['bk-a', 'bk-b', 'bk-c', 'bk-d', 'bk-e'].map((id) => (
            <div
              key={id}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 h-5 w-1/3 rounded bg-gray-200"></div>
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-4 w-1/4 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      )}
      {!loading && bookings.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No bookings found
          </h3>
          <p className="text-gray-600">
            Bookings will appear here as customers make reservations.
          </p>
        </div>
      )}
      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <div
                key={booking.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.customerName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-2 xl:grid-cols-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{booking.customerPhone}</span>
                        </div>
                        {booking.customerEmail && (
                          <div className="flex items-center gap-2 break-all">
                            <Mail className="h-4 w-4" />
                            <span>{booking.customerEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        {booking.pg && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{booking.pg.name}</span>
                          </div>
                        )}
                        {booking.room && (
                          <div className="flex items-center gap-2">
                            <BedDouble className="h-4 w-4" />
                            <span>
                              Room {booking.room.roomNumber} (
                              {booking.room.roomType})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Check-in{' '}
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                        </div>
                        {booking.checkOutDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Check-out{' '}
                              {new Date(
                                booking.checkOutDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <IndianRupee className="h-4 w-4" />
                          <span>
                            Total ₹{booking.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            booking.paidAmount >= booking.totalAmount
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}
                        >
                          <IndianRupee className="h-4 w-4" />
                          <span>
                            Paid ₹{booking.paidAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row gap-2 lg:ml-4 lg:flex-col lg:items-stretch">
                    {booking.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateBookingStatus(booking.id, 'CONFIRMED')
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateBookingStatus(booking.id, 'CANCELLED')
                          }
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateBookingStatus(booking.id, 'COMPLETED')
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Booked: {new Date(booking.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-2xl"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-2xl"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

