'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Building2,
  Users,
  IndianRupee,
  Calendar,
  Eye,
  Wind,
  Bath,
  Home,
  Zap,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  slug: string;
  description?: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  currentOccupancy: number;
  floor: number;
  roomSize?: number;
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  hasFan: boolean;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  electricityIncluded: boolean;
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  availableFrom?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
    state: string;
  };
  tenants: Tenant[];
  bookings: Booking[];
  _count: {
    tenants: number;
    bookings: number;
  };
}

interface Tenant {
  id: string;
  moveInDate: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
  };
}

interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  checkInDate: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
}

interface RoomDetailsPageProps {
  params: { id: string };
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    AVAILABLE: 'bg-green-100 text-green-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
    RESERVED: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}
    >
      {status}
    </span>
  );
};

const BookingStatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const icons = {
    PENDING: <Clock className="h-3 w-3 mr-1" />,
    CONFIRMED: <CheckCircle className="h-3 w-3 mr-1" />,
    CANCELLED: <XCircle className="h-3 w-3 mr-1" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}
    >
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
};

export default function RoomDetailsPage({
  params,
}: Readonly<RoomDetailsPageProps>) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRoomDetails();
  }, [params.id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/rooms/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else {
        console.error('Failed to fetch room details');
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="px-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMissingRoomState = () => (
    <div className="px-6">
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Room not found
        </h3>
        <p className="text-gray-600">
          This room may have been deleted or moved.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (!room) {
    return renderMissingRoomState();
  }

  const occupancyPercentage = Math.round(
    (room.currentOccupancy / room.maxOccupancy) * 100,
  );

  return (
    <div className="px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/rooms"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Room {room.roomNumber}
              </h1>
              <StatusBadge status={room.availabilityStatus} />
              {!room.isActive && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-gray-600">
              <Link
                href={`/admin/pgs/${room.pg.id}`}
                className="hover:text-blue-600"
              >
                {room.pg.name}
              </Link>{' '}
              • {room.pg.area}, {room.pg.city}, {room.pg.state}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/rooms/${room.slug}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Room
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          {[
            { id: 'overview', name: 'Overview', icon: Eye },
            { id: 'tenants', name: 'Current Tenants', icon: Users },
            { id: 'bookings', name: 'Recent Bookings', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
                {tab.id === 'tenants' && room._count.tenants > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {room._count.tenants}
                  </span>
                )}
                {tab.id === 'bookings' && room._count.bookings > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {room._count.bookings}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Room Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Room Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Basic Information
                    </h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-500">
                            Room Type
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {room.roomType.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-500">
                            Max Occupancy
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {room.maxOccupancy} persons
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-500">
                            Current Occupancy
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {room.currentOccupancy} / {room.maxOccupancy} (
                          {occupancyPercentage}%)
                        </span>
                      </div>

                      {room.roomSize && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-500">
                              Room Size
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {room.roomSize} sq ft
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {room.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">{room.description}</p>
                  </div>
                )}
              </div>

              {/* Pricing Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pricing Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <IndianRupee className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{room.monthlyRent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      ₹{room.securityDeposit.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Security Deposit</p>
                  </div>

                  {room.maintenanceCharges && room.maintenanceCharges > 0 && (
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{room.maintenanceCharges.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Maintenance</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Electricity:</span>{' '}
                    {room.electricityIncluded ? 'Included' : 'Not Included'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Tenants
                </h3>

                {room.tenants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Current Tenants
                    </h4>
                    <p className="text-gray-600">
                      This room is currently empty.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {room.tenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {tenant.user.name}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {tenant.user.mobile}
                                </div>
                                {tenant.user.email && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {tenant.user.email}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Move-in Date:{' '}
                                {new Date(
                                  tenant.moveInDate,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Bookings
                </h3>

                {room.bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Bookings
                    </h4>
                    <p className="text-gray-600">
                      No booking history available for this room.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {room.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {booking.customerName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.customerPhone}
                            </p>
                          </div>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            Check-in:{' '}
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            Booked:{' '}
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Tenants</span>
                <span className="font-medium text-gray-900">
                  {room._count.tenants}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="font-medium text-gray-900">
                  {room._count.bookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className="font-medium text-gray-900">
                  {occupancyPercentage}%
                </span>
              </div>
              {room.availableFrom && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available From</span>
                  <span className="font-medium text-gray-900">
                    {new Date(room.availableFrom).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Room Meta */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Room Information
            </h3>

            <div className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Room ID</dt>
                <dd className="text-sm font-mono text-gray-900">{room.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(room.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(room.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

