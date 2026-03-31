'use client';

import useSWR from 'swr';
import Link from 'next/link';
import {
  BedDouble,
  Building,
  Calendar,
  MessageSquare,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Real-time room list: number, price, occupancy
interface RoomRow {
  id: string;
  slug: string;
  roomNumber: string;
  roomType: string;
  monthlyRent: string | number;
  maxOccupancy: number;
  currentOccupancy: number;
  availabilityStatus: string;
  pg: { id: string; name: string };
}

interface RoomsResponse {
  rooms: RoomRow[];
  total: number;
}

interface Stats {
  totalPGs: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  pendingBookings: number;
  newInquiries: number;
}

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  RESERVED: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

export default function AdminDashboard() {
  // Stats — refresh every 60 s
  const { data: stats } = useSWR<Stats>('/api/admin/stats', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  // Room list with price + occupancy — refresh every 30 s
  const { data: roomsData, isLoading: roomsLoading } = useSWR<RoomsResponse>(
    '/api/admin/rooms?limit=100',
    fetcher,
    { refreshInterval: 30_000, dedupingInterval: 10_000 },
  );

  const rooms = roomsData?.rooms ?? [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="secondary">Admin</Badge>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total PGs',
            value: stats?.totalPGs ?? '—',
            icon: Building,
            color: 'text-green-600',
            href: '/admin/pgs',
          },
          {
            label: 'Total Rooms',
            value: stats?.totalRooms ?? '—',
            icon: BedDouble,
            color: 'text-purple-600',
            href: '/admin/rooms',
          },
          {
            label: 'Available',
            value: stats?.availableRooms ?? '—',
            icon: TrendingUp,
            color: 'text-blue-600',
            href: '/admin/rooms',
          },
          {
            label: 'Occupancy',
            value: stats ? `${stats.occupancyRate}%` : '—',
            icon: TrendingUp,
            color: 'text-indigo-600',
          },
        ].map((s) => {
          const card = (
            <Card
              key={s.label}
              className={
                s.href ? 'hover:shadow-md cursor-pointer transition-shadow' : ''
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {s.label}
                </CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/pgs/create">
          <Button variant="outline" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New PG
          </Button>
        </Link>
        <Link href="/admin/rooms/create">
          <Button variant="outline" size="sm" className="gap-2">
            <BedDouble className="h-4 w-4" />
            New Room
          </Button>
        </Link>
        <Link href="/admin/bookings">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
            {stats?.pendingBookings ? ` (${stats.pendingBookings})` : ''}
          </Button>
        </Link>
        <Link href="/admin/inquiries">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Inquiries{stats?.newInquiries ? ` (${stats.newInquiries})` : ''}
          </Button>
        </Link>
      </div>

      {/* Room inventory table: No, Price, Qty */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Room Inventory</CardTitle>
          <span className="text-xs text-gray-400">
            Live · refreshes every 30 s
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {roomsLoading && (
            <div className="p-6 space-y-2">
              {['r1', 'r2', 'r3', 'r4', 'r5'].map((k) => (
                <div
                  key={k}
                  className="h-10 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          )}
          {!roomsLoading && rooms.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <BedDouble className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No rooms yet.</p>
              <Link href="/admin/rooms/create">
                <Button size="sm" className="mt-3">
                  Add First Room
                </Button>
              </Link>
            </div>
          )}
          {!roomsLoading && rooms.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">PG</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Room No.
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">
                      Price / mo
                    </th>
                    <th className="text-center px-4 py-3 font-medium">
                      Occupied / Max
                    </th>
                    <th className="text-center px-4 py-3 font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {room.pg.name}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {room.roomNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {room.roomType.toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        ₹{Number(room.monthlyRent).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            room.currentOccupancy >= room.maxOccupancy
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-700'
                          }
                        >
                          {room.currentOccupancy} / {room.maxOccupancy}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            STATUS_COLOR[room.availabilityStatus] ??
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {room.availabilityStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/rooms/${room.slug}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

