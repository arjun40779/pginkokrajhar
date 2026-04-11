'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  IndianRupee,
  Eye,
  Plus,
  MoreHorizontal,
  BedDouble,
  Trash2,
} from 'lucide-react';

interface PG {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  alternatePhone?: string;
  startingPrice: number;
  totalRooms: number;
  availableRooms: number;
  isActive: boolean;
  createdAt: string;
  rooms: Room[];
  bookings: Booking[];
  inquiries: Inquiry[];
  _count: {
    rooms: number;
    bookings: number;
    inquiries: number;
  };
}

interface Room {
  id: string;
  roomNumber: string;
  slug: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  currentOccupancy: number;
  floor: number;
  monthlyRent: number;
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  featured: boolean;
  tenants: Tenant[];
  _count: {
    tenants: number;
  };
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  moveInDate: string;
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  checkInDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  monthlyRent: number;
}

interface Inquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

const StatusBadge = ({
  status,
  type,
}: {
  status: string;
  type: 'room' | 'booking' | 'inquiry';
}) => {
  const styles = {
    room: {
      AVAILABLE: 'bg-green-100 text-green-800',
      OCCUPIED: 'bg-blue-100 text-blue-800',
      MAINTENANCE: 'bg-orange-100 text-orange-800',
      RESERVED: 'bg-purple-100 text-purple-800',
    },
    booking: {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    },
    inquiry: {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type][status as keyof (typeof styles)[typeof type]]}`}
    >
      {status}
    </span>
  );
};

const RoomCard = ({
  room,
  onDelete,
}: {
  room: Room;
  onDelete: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'SINGLE':
        return <BedDouble className="h-4 w-4" />;
      case 'DOUBLE':
        return <BedDouble className="h-4 w-4" />;
      case 'TRIPLE':
        return <BedDouble className="h-4 w-4" />;
      case 'DORMITORY':
        return <Users className="h-4 w-4" />;
      default:
        return <BedDouble className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center text-lg font-semibold text-gray-900">
              {getRoomTypeIcon(room.roomType)}
              <span className="ml-2">{room.roomNumber}</span>
            </div>
            {room.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="capitalize">{room.roomType.toLowerCase()}</span>
            <span className="mx-2">•</span>
            <span>Floor {room.floor}</span>
            <span className="mx-2">•</span>
            <span>Max {room.maxOccupancy}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-900">
            <IndianRupee className="h-4 w-4 mr-1" />
            {room.monthlyRent.toLocaleString()}/month
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={room.availabilityStatus} type="room" />
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <Link
                    href={`/admin/rooms/${room.id}/edit`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit Room
                  </Link>
                  <button
                    onClick={() => onDelete(room.id)}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          {room.hasAC && <span className="text-blue-600">AC</span>}
          {room.hasAttachedBath && (
            <span className="text-green-600">Attached Bath</span>
          )}
          {room.hasBalcony && <span className="text-purple-600">Balcony</span>}
        </div>
        <div className="flex items-center text-gray-500">
          <Users className="h-3 w-3 mr-1" />
          {room.currentOccupancy}/{room.maxOccupancy}
        </div>
      </div>
    </div>
  );
};

export default function PGDetailsPage({
  params,
}: Readonly<{ params: { id: string } }>) {
  const [pg, setPg] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPG();
  }, [params.id]);

  const fetchPG = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/pgs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPg(data);
      } else {
        // Handle error
      }
    } catch (error) {
      console.error('Failed to fetch PG:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 404) {
        // Refresh PG data to update room list (404 = already deleted)
        fetchPG();
      } else {
        await response.json().catch(() => null);
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="px-6">
        <div className="text-center py-12">
          <p className="text-gray-500">PG not found</p>
        </div>
      </div>
    );
  }

  const occupancyRate =
    pg.totalRooms > 0
      ? ((pg.totalRooms - pg.availableRooms) / pg.totalRooms) * 100
      : 0;

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/pgs"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{pg.name}</h1>
            </div>
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {pg.area}, {pg.city}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/pgs/${pg.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit PG
          </Link>
          <Link
            href={`/admin/pgs/${pg.id}/rooms`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Manage Rooms
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-md bg-blue-50 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {pg._count.rooms}
              </p>
              <p className="text-sm font-medium text-gray-500">Total Rooms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-md bg-green-50 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {pg.availableRooms}
              </p>
              <p className="text-sm font-medium text-gray-500">Available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-md bg-orange-50 p-3">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(occupancyRate)}%
              </p>
              <p className="text-sm font-medium text-gray-500">Occupancy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-md bg-purple-50 p-3">
              <IndianRupee className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                ₹{pg.startingPrice.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-gray-500">
                Starting Price
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              {pg.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="text-gray-900">{pg.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{pg.address}</p>
                <p className="text-gray-500">
                  {pg.area}, {pg.city}, {pg.state} - {pg.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{pg.ownerName}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{pg.ownerPhone}</span>
              </div>
              {pg.ownerEmail && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{pg.ownerEmail}</span>
                </div>
              )}
              {pg.alternatePhone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{pg.alternatePhone}</span>
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    Alt
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Rooms Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Rooms ({pg.rooms.length})
              </h2>
              <Link
                href={`/admin/rooms/create?pgId=${pg.id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Link>
            </div>

            {pg.rooms.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No rooms added yet</p>
                <Link
                  href={`/admin/rooms/create?pgId=${pg.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Room
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pg.rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onDelete={handleDeleteRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Starting Price
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{pg.startingPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {(pg.bookings.length > 0 || pg.inquiries.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {pg.bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Booking • {booking.customerPhone}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} type="booking" />
                  </div>
                ))}
                {pg.inquiries.slice(0, 2).map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {inquiry.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Inquiry • {inquiry.customerPhone}
                      </p>
                    </div>
                    <StatusBadge status={inquiry.status} type="inquiry" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

