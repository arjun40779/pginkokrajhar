import Link from 'next/link';
import { Plus, Pencil, Bed, Users, DoorOpen } from 'lucide-react';

import { prisma } from '@/prisma';

import { Button } from '../ui/button';
import { DeleteRoomButton } from './DeleteRoomButton';

function getStatusColor(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800';
    case 'OCCUPIED':
      return 'bg-blue-100 text-blue-800';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800';
    case 'RESERVED':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatRoomType(roomType: string) {
  switch (roomType) {
    case 'SINGLE':
      return 'Single';
    case 'DOUBLE':
      return 'Double';
    case 'TRIPLE':
      return 'Triple';
    case 'DORMITORY':
      return 'Dormitory';
    default:
      return roomType;
  }
}

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function RoomManagement() {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: [{ pg: { name: 'asc' } }, { roomNumber: 'asc' }],
    include: {
      pg: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Room Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage all rooms across your properties
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/rooms/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PG Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No rooms found.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DoorOpen className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium">{room.roomNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      <Link
                        href={`/admin/pgs/${room.pg.id}`}
                        className="hover:text-blue-600"
                      >
                        {room.pg.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {room.floor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span>{formatRoomType(room.roomType)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>
                          {room.currentOccupancy}/{room.maxOccupancy}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      ₹{Number(room.monthlyRent).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(room.availabilityStatus)}`}
                      >
                        {formatStatus(room.availabilityStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/rooms/${room.slug}/edit`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteRoomButton roomId={room.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

