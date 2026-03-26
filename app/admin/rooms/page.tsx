'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  MapPin,
  Users,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
  Star,
  BedDouble,
  Wind,
  Bath,
  BalconyIcon,
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  slug: string;
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
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  availableFrom?: string;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
  };
  _count: {
    tenants: number;
    bookings: number;
  };
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

const RoomTypeIcon = ({ type }: { type: string }) => {
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

const RoomCard = ({
  room,
  onDelete,
}: {
  room: Room;
  onDelete: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center text-lg font-semibold text-gray-900">
              <RoomTypeIcon type={room.roomType} />
              <span className="ml-2">{room.roomNumber}</span>
            </div>
            {room.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {!room.isActive && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                Inactive
              </span>
            )}
          </div>

          <Link
            href={`/admin/pgs/${room.pg.id}`}
            className="flex items-center text-sm text-gray-500 mb-2 hover:text-blue-600"
          >
            <Building2 className="h-4 w-4 mr-1" />
            {room.pg.name}
          </Link>

          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {room.pg.area}, {room.pg.city}
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="capitalize">{room.roomType.toLowerCase()}</span>
            <span className="mx-2">•</span>
            <span>Floor {room.floor}</span>
            <span className="mx-2">•</span>
            <span>Max {room.maxOccupancy}</span>
            {room.roomSize && (
              <>
                <span className="mx-2">•</span>
                <span>{room.roomSize} sq ft</span>
              </>
            )}
          </div>

          <div className="flex items-center text-lg font-semibold text-gray-900 mb-2">
            <IndianRupee className="h-5 w-5 mr-1" />
            {room.monthlyRent.toLocaleString()}/month
          </div>

          {/* Features */}
          <div className="flex items-center space-x-3 text-sm">
            {room.hasAC && (
              <span className="flex items-center text-blue-600">
                <Wind className="h-3 w-3 mr-1" />
                AC
              </span>
            )}
            {room.hasAttachedBath && (
              <span className="flex items-center text-green-600">
                <Bath className="h-3 w-3 mr-1" />
                Attached Bath
              </span>
            )}
            {room.hasBalcony && (
              <span className="flex items-center text-purple-600">Balcony</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={room.availabilityStatus} />
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <Link
                    href={`/admin/rooms/${room.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    href={`/admin/rooms/${room.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Room
                  </Link>
                  <Link
                    href={`/admin/pgs/${room.pg.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View PG
                  </Link>
                  <button
                    onClick={() => onDelete(room.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">
            {room._count.tenants}
          </p>
          <p className="text-xs text-gray-500">Current Tenants</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">
            {room._count.bookings}
          </p>
          <p className="text-xs text-gray-500">Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">
            {Math.round((room.currentOccupancy / room.maxOccupancy) * 100)}%
          </p>
          <p className="text-xs text-gray-500">Occupied</p>
        </div>
      </div>
    </div>
  );
};

export default function RoomsListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, [searchTerm, statusFilter, roomTypeFilter, featuredFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roomTypeFilter !== 'all') params.append('roomType', roomTypeFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter);

      const response = await fetch(`/api/admin/rooms?${params}`);
      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this room? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRooms(rooms.filter((room) => room.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert('Failed to delete room');
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600">
            Manage individual rooms across all PGs
          </p>
        </div>
        <Link
          href="/admin/rooms/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by number, PG name, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>

            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="dormitory">Dormitory</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Rooms</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BedDouble className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No rooms found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ||
            statusFilter !== 'all' ||
            roomTypeFilter !== 'all' ||
            featuredFilter !== 'all'
              ? 'No rooms match your current filters.'
              : "You haven't added any rooms yet."}
          </p>
          <Link
            href="/admin/rooms/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Room
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
