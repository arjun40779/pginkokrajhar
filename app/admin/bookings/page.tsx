'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  BedDouble,
  IndianRupee,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
  COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage booking requests and reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <div className="flex gap-2">
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
                  {status === 'all' ? 'All' : status}
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
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}
      {!loading && bookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
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
            const StatusIcon = statusConfig[booking.status]?.icon || Clock;
            return (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.customerName}
                      </h3>
                      <Badge
                        className={
                          statusConfig[booking.status]?.color ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{booking.customerPhone}</span>
                        </div>
                        {booking.customerEmail && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{booking.customerEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
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
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Check-in:{' '}
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          <span>
                            Total: ₹{booking.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          <span
                            className={
                              booking.paidAmount >= booking.totalAmount
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }
                          >
                            Paid: ₹{booking.paidAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-gray-500 mt-3 italic">
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
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

                <div className="text-xs text-gray-400 mt-3">
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

