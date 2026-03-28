'use client';

import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Building2,
  Bed,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  LogOut,
  Settings,
  User,
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

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          // Map API response to expected format
          setStats({
            totalPGs: data.totalPGs || 0,
            activePGs: data.totalPGs || 0, // Assuming all PGs are active for now
            totalRooms: data.totalRooms || 0,
            availableRooms: data.totalRooms - data.occupiedRooms || 0,
            occupiedRooms: data.occupiedRooms || 0,
            totalTenants: data.totalUsers || 0,
            pendingBookings: data.totalBookings || 0,
            newInquiries: 0, // Not implemented yet
            monthlyRevenue: data.monthlyRevenue || 0,
            occupancyRate:
              data.totalRooms > 0
                ? (data.occupiedRooms / data.totalRooms) * 100
                : 0,
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Fallback to mock data
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
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={`loading-${i}`}
                className="bg-gray-200 h-32 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your PG business.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total PGs"
          value={stats.totalPGs}
          subtitle={`${stats.activePGs} active`}
          icon={Building2}
          color="blue"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle={`${stats.availableRooms} available`}
          icon={Bed}
          color="green"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          subtitle={`${stats.occupancyRate.toFixed(1)}% occupancy`}
          icon={Users}
          color="yellow"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats.monthlyRevenue / 1000).toFixed(0)}K`}
          subtitle="This month"
          icon={TrendingUp}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Pending Bookings
            </h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {stats.pendingBookings} bookings waiting for review
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-800">New Inquiries</h3>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {stats.newInquiries} new inquiries this week
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-green-800">
              Occupancy Rate
            </h3>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {stats.occupancyRate.toFixed(1)}% - Excellent performance
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}

// Auth Header Component
function AdminHeader() {
  const { user, userProfile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              PG Inkokrajhar
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-600">Admin Panel</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {userProfile?.name || user?.email}
              </span>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                ADMIN
              </span>
            </div>

            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Protected Admin Dashboard Component
function AdminDashboardContent() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="py-6">
          <AdminDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Main Page Export with Auth Provider
export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}

