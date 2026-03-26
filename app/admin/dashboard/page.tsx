'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Bed,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalPGs: number;
  activePGs: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalTenants: number;
  pendingBookings: number;
  newInquiries: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  trend?: { value: number; isPositive: boolean };
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 mr-1 ${
                  trend.isPositive ? '' : 'rotate-180'
                }`}
              />
              {Math.abs(trend.value)}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const QuickActions = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <a
          href="/admin/pgs/create"
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Add New PG
        </a>
        <a
          href="/admin/rooms/create"
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
        >
          <Bed className="h-4 w-4 mr-2" />
          Add New Room
        </a>
        <a
          href="/admin/tenants"
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Tenants
        </a>
        <a
          href="/admin/bookings"
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Review Bookings
        </a>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              New tenant checked into Room 101
            </p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">New PG 'Comfort Stay' added</p>
            <p className="text-xs text-gray-500">5 hours ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              Booking inquiry from John Doe
            </p>
            <p className="text-xs text-gray-500">1 day ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              Maintenance request for Room 205
            </p>
            <p className="text-xs text-gray-500">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real dashboard stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalPGs: 12,
        activePGs: 10,
        totalRooms: 145,
        availableRooms: 23,
        occupiedRooms: 122,
        totalTenants: 98,
        pendingBookings: 7,
        newInquiries: 15,
        monthlyRevenue: 485000,
        occupancyRate: 84.1,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your PG business.
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-60">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your PG business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total PGs"
          value={stats?.totalPGs || 0}
          subtitle={`${stats?.activePGs || 0} active`}
          icon={Building2}
          color="blue"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Total Rooms"
          value={stats?.totalRooms || 0}
          subtitle={`${stats?.availableRooms || 0} available`}
          icon={Bed}
          color="green"
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Active Tenants"
          value={stats?.totalTenants || 0}
          subtitle={`${stats?.occupancyRate || 0}% occupancy`}
          icon={Users}
          color="yellow"
          trend={{ value: 2.4, isPositive: false }}
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.pendingBookings || 0}
          subtitle={`${stats?.newInquiries || 0} new inquiries`}
          icon={Calendar}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-80">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Monthly Revenue
            </h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{stats?.monthlyRevenue?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-green-600 mt-2">+12.5% from last month</p>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Occupancy Rate
            </h3>
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.occupancyRate || 0}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${stats?.occupancyRate || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Alerts</h3>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                2 maintenance requests pending
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                5 rent payments overdue
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                3 rooms available this month
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}
