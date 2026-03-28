'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  Bed,
  Users,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  LogOut,
  User,
} from 'lucide-react';

import '@/app/globals.css';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'PGs', href: '/admin/pgs', icon: Building2 },
  { name: 'Rooms', href: '/admin/rooms', icon: Bed },
  { name: 'Tenants', href: '/admin/tenants', icon: Users },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Inquiries', href: '/admin/inquiries', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">PG Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {userProfile?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />

        {/* Main content */}
        <div className="pl-64">
          <main className="py-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head></head>
      <body>
        <AuthProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

