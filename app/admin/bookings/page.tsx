'use client';

import { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminBookings, useAdminPGs } from '@/lib/hooks/useApi';
import AdmissionDetails from '@/components/admin/AdmissionDetails';

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
  dateOfBirth?: string;
  schoolCollege?: string;
  foodType?: string;
  foodRestrictions?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  village?: string;
  postOffice?: string;
  pinCode?: string;
  district?: string;
  addressState?: string;
  declarationAccepted?: boolean;
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

interface BookingsResponse {
  bookings?: Booking[];
  pagination?: {
    pages?: number;
  };
}

export default function AdminBookingsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pgFilter, setPgFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: pgData } = useAdminPGs(1, 100) as {
    data?: { pgs?: { id: string; name: string }[] };
  };
  const pgs = pgData?.pgs || [];

  const { data, error, isLoading, mutate } = useAdminBookings(
    page,
    statusFilter === 'all' ? '' : statusFilter,
    search,
    10,
    pgFilter === 'all' ? '' : pgFilter,
  ) as {
    data?: BookingsResponse;
    error?: Error;
    isLoading: boolean;
    mutate: () => Promise<BookingsResponse | undefined>;
  };

  const bookings = data?.bookings || [];
  const totalPages = data?.pagination?.pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      await mutate();
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setUpdatingId(null);
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border-gray-200 bg-gray-50 pl-10"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <Select
              value={pgFilter}
              onValueChange={(value) => {
                setPgFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by PG" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All PGs</SelectItem>
                {pgs.map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                className={statusFilter === status ? 'bg-black text-white' : ''}
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
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* Bookings List */}
      {isLoading && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {['bk-a', 'bk-b', 'bk-c', 'bk-d', 'bk-e'].map((id) => (
            <div
              key={id}
              className="animate-pulse border-b border-gray-200 px-5 py-5 last:border-b-0"
            >
              <div className="mb-3 h-5 w-1/4 rounded bg-gray-200"></div>
              <div className="grid gap-3 lg:grid-cols-5">
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-8 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && bookings.length === 0 && (
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
      {!isLoading && bookings.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="hidden border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1fr)_120px] lg:gap-4">
            <span>Guest</span>
            <span>Property</span>
            <span>Schedule</span>
            <span>Payment</span>
            <span>Actions</span>
          </div>

          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <div
                key={booking.id}
                className="border-b border-gray-200 px-5 py-5 transition-colors hover:bg-gray-50 last:border-b-0 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.3fr)_minmax(0,1fr)_120px] lg:items-start lg:gap-4"
              >
                <div className="min-w-0">
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

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
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

                  {booking.notes && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                      {booking.notes}
                    </p>
                  )}

                  <div className="mt-3 text-xs text-gray-400">
                    Booked: {new Date(booking.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600 lg:mt-0">
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
                        Room {booking.room.roomNumber} ({booking.room.roomType})
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600 lg:mt-0">
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
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 lg:mt-0">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <IndianRupee className="h-4 w-4" />
                    <span>Total ₹{booking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      booking.paidAmount >= booking.totalAmount
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    <IndianRupee className="h-4 w-4" />
                    <span>Paid ₹{booking.paidAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-row gap-2 lg:mt-0 lg:flex-col lg:items-stretch">
                  {booking.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        disabled={updatingId === booking.id}
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
                        disabled={updatingId === booking.id}
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
                      disabled={updatingId === booking.id}
                      onClick={() =>
                        updateBookingStatus(booking.id, 'COMPLETED')
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setExpandedId(
                        expandedId === booking.id ? null : booking.id,
                      )
                    }
                  >
                    {expandedId === booking.id ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    Details
                  </Button>
                </div>

                {expandedId === booking.id && (
                  <div className="col-span-full mt-4 border-t border-gray-200 pt-4">
                    <AdmissionDetails booking={booking} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-gray-200 px-5 py-4">
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

