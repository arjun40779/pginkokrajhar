'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  Users,
  IndianRupee,
  Edit,
  Trash2,
  Star,
  BedDouble,
  Wind,
  Bath,
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
  tenants: Tenant[];
  _count: {
    tenants: number;
    bookings: number;
  };
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  moveInDate: string;
}

interface PG {
  id: string;
  name: string;
  area: string;
  city: string;
  state: string;
  totalRooms: number;
  availableRooms: number;
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

          <div className="flex items-center text-sm text-gray-500 mb-2">
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
          <div className="flex items-center space-x-3 text-sm mb-3">
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
              <span className="text-purple-600">Balcony</span>
            )}
          </div>

          {/* Current Tenants */}
          {room.tenants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Current Tenants:
              </p>
              <div className="space-y-1">
                {room.tenants.map((tenant) => (
                  <div key={tenant.id} className="text-xs text-gray-600">
                    {tenant.name} • {tenant.phone}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    <Building2 className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    href={`/admin/rooms/${room.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Room
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
          <p className="text-xs text-gray-500">Tenants</p>
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

export default function PGRoomsPage({ params }: { params: { id: string } }) {
  const [pg, setPg] = useState<PG | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch PG details
      const pgResponse = await fetch(`/api/admin/pgs/${params.id}`);
      if (pgResponse.ok) {
        const pgData = await pgResponse.json();
        setPg({
          id: pgData.id,
          name: pgData.name,
          area: pgData.area,
          city: pgData.city,
          state: pgData.state,
          totalRooms: pgData.totalRooms,
          availableRooms: pgData.availableRooms,
        });
        setRooms(pgData.rooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this room? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRooms(rooms.filter((room) => room.id !== roomId));
        // Update PG totals
        if (pg) {
          setPg({
            ...pg,
            totalRooms: pg.totalRooms - 1,
            availableRooms: Math.max(0, pg.availableRooms - 1),
          });
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert('Failed to delete room');
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      room.availabilityStatus.toLowerCase() === statusFilter.toLowerCase();

    const matchesRoomType =
      roomTypeFilter === 'all' ||
      room.roomType.toLowerCase() === roomTypeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesRoomType;
  });

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
            href={`/admin/pgs/${pg.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Rooms - {pg.name}
            </h1>
            <p className="text-gray-600">
              {pg.area}, {pg.city}, {pg.state}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/rooms/create?pgId=${pg.id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Link>
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
                {pg.totalRooms}
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
              <BedDouble className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {pg.totalRooms - pg.availableRooms}
              </p>
              <p className="text-sm font-medium text-gray-500">Occupied</p>
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
                {Math.round(occupancyRate)}%
              </p>
              <p className="text-sm font-medium text-gray-500">Occupancy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by number or type..."
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
          </div>
        </div>
      </div>

      {/* Room List */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BedDouble className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {rooms.length === 0
              ? 'No rooms found'
              : 'No rooms match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {rooms.length === 0
              ? "This PG doesn't have any rooms yet."
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {rooms.length === 0 && (
            <Link
              href={`/admin/rooms/create?pgId=${pg.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Room
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onDelete={handleDeleteRoom} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
