'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building,
  BedDouble,
  CreditCard,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalPGs: number;
  totalRooms: number;
  occupiedRooms: number;
  totalBookings: number;
  pendingPayments: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPGs: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total PGs',
      value: stats.totalPGs,
      icon: Building,
      color: 'text-green-600',
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: BedDouble,
      color: 'text-purple-600',
    },
    {
      title: 'Occupied Rooms',
      value: stats.occupiedRooms,
      icon: BedDouble,
      color: 'text-orange-600',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-indigo-600',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: CreditCard,
      color: 'text-red-600',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Administrator</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your PG business efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View and manage user accounts
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Manage PGs</h3>
                <p className="text-sm text-gray-600">
                  Add and manage PG properties
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Payment Management</h3>
                <p className="text-sm text-gray-600">
                  Track payments and revenues
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from your PG management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">New user registration</p>
                <p className="text-sm text-gray-600">
                  John Doe joined as a tenant
                </p>
              </div>
              <Badge variant="outline">2 hours ago</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Payment received</p>
                <p className="text-sm text-gray-600">
                  ₹15,000 rent payment from Green Valley PG
                </p>
              </div>
              <Badge variant="outline">5 hours ago</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">New booking</p>
                <p className="text-sm text-gray-600">
                  Room 201 booked at Sunrise PG
                </p>
              </div>
              <Badge variant="outline">1 day ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
