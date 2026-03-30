'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bed,
  Building,
  Building2,
  Calendar,
  IndianRupee,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';

type MonthlyTrend = {
  month: string;
  bookings: number;
  revenue: number;
};

type RoomStatusBreakdown = {
  name: string;
  value: number;
};

type RecentBooking = {
  id: string;
  customerName: string;
  createdAt: string;
  pg: { name: string } | null;
  room: { roomNumber: string } | null;
};

type RecentInquiry = {
  id: string;
  name: string;
  createdAt: string;
  pg: { name: string } | null;
};

type DashboardStatsResponse = {
  totalPGs: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalBookings: number;
  pendingBookings: number;
  totalInquiries: number;
  newInquiries: number;
  activeTenants: number;
  pendingPayments: number;
  monthlyRevenue: number;
  occupancyRate: number;
  recentBookings: RecentBooking[];
  recentInquiries: RecentInquiry[];
  monthlyTrends: MonthlyTrend[];
  roomStatusBreakdown: RoomStatusBreakdown[];
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 1,
});

const occupancyColors: Record<string, string> = {
  Occupied: '#2563eb',
  Available: '#10b981',
  Reserved: '#f59e0b',
  Maintenance: '#ef4444',
  Vacant: '#94a3b8',
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof Building2;
  tone: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-2xl p-3 text-white ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      href: '/admin/pgs/create',
      label: 'Add New PG',
      description: 'Create a new property profile',
      icon: Building,
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      href: '/admin/rooms/create',
      label: 'Add New Room',
      description: 'Publish inventory for bookings',
      icon: Bed,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      href: '/admin/tenants',
      label: 'Manage Tenants',
      description: 'Review active residents and dues',
      icon: Users,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      href: '/admin/bookings',
      label: 'Review Bookings',
      description: 'Approve or update booking requests',
      icon: Calendar,
      tone: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
        <p className="text-sm text-slate-500">
          Move through daily admin work faster
        </p>
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-2xl p-3 ${action.tone}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{action.label}</p>
                <p className="text-sm text-slate-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/stats', { cache: 'no-store' });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error || 'Failed to load dashboard data');
        }

        const data = (await response.json()) as DashboardStatsResponse;
        setStats(data);
      } catch (fetchError) {
        console.error('Failed to load dashboard data', fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load dashboard data',
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-slate-950">Dashboard</h2>
          <p className="mt-2 text-slate-500">Loading dashboard data...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`dashboard-stat-${index}`}
                className="h-36 rounded-3xl bg-slate-200"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="h-80 rounded-3xl bg-slate-200 xl:col-span-2" />
            <div className="h-80 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-2 text-rose-700">
          {error || 'Failed to load dashboard data.'}
        </p>
        <div className="mt-4">
          <Button onClick={() => globalThis.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const occupancyData =
    stats.roomStatusBreakdown.length > 0
      ? stats.roomStatusBreakdown
      : [{ name: 'No rooms', value: 1 }];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total PGs"
          value={stats.totalPGs}
          subtitle={`${stats.totalRooms} rooms across all properties`}
          icon={Building2}
          tone="bg-blue-600"
        />
        <StatCard
          title="Active Tenants"
          value={stats.activeTenants}
          subtitle={`${stats.occupiedRooms} rooms currently occupied`}
          icon={Users}
          tone="bg-emerald-500"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          subtitle={`${stats.totalBookings} total bookings recorded`}
          icon={Calendar}
          tone="bg-amber-500"
        />
        <StatCard
          title="New Inquiries"
          value={stats.newInquiries}
          subtitle={`${stats.totalInquiries} inquiries in the system`}
          icon={MessageSquare}
          tone="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Booking and Revenue Trend
              </h3>
              <p className="text-sm text-slate-500">
                Last six months of actual bookings and completed payments
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) =>
                  compactCurrencyFormatter.format(value)
                }
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'revenue'
                    ? currencyFormatter.format(value)
                    : value.toLocaleString('en-IN'),
                  name === 'revenue' ? 'Revenue' : 'Bookings',
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bookings"
                stroke="#2563eb"
                strokeWidth={2}
                name="Bookings"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Room Status</h3>
          <p className="text-sm text-slate-500">
            Real-time distribution of room availability
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                outerRadius={96}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {occupancyData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={occupancyColors[entry.name] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString('en-IN')}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">
            Monthly Revenue
          </h3>
          <p className="mb-5 text-sm text-slate-500">
            Completed payment collections over the last six months
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) =>
                  compactCurrencyFormatter.format(value)
                }
              />
              <Tooltip
                formatter={(value: number) => currencyFormatter.format(value)}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#2563eb"
                name="Revenue"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <QuickActions />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3">
            <AlertCircle className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Activity
            </h3>
            <p className="text-sm text-slate-500">
              Latest bookings and inquiries from your admin feed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Latest Bookings
            </h4>
            <div className="space-y-3">
              {stats.recentBookings.length === 0 ? (
                <p className="text-xs text-slate-400">No recent bookings.</p>
              ) : (
                stats.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm text-slate-900">
                      {booking.customerName} booked{' '}
                      {booking.room?.roomNumber || 'a room'} at{' '}
                      {booking.pg?.name || 'PG'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(booking.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              New Inquiries
            </h4>
            <div className="space-y-3">
              {stats.recentInquiries.length === 0 ? (
                <p className="text-xs text-slate-400">No recent inquiries.</p>
              ) : (
                stats.recentInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm text-slate-900">
                      {inquiry.name} enquired about {inquiry.pg?.name || 'a PG'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(inquiry.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3">
              <Calendar className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                Pending Bookings
              </p>
              <p className="text-sm text-amber-700">
                {stats.pendingBookings} awaiting review
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-100 p-3">
              <MessageSquare className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Fresh Inquiries
              </p>
              <p className="text-sm text-blue-700">
                {stats.newInquiries} new inquiries need follow-up
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <IndianRupee className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">
                Collections This Month
              </p>
              <p className="text-sm text-emerald-700">
                {currencyFormatter.format(stats.monthlyRevenue)} collected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

