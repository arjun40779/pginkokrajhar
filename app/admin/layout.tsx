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
} from 'lucide-react';

import '@/app/globals.css';

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html>
      <head></head>
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
            <div className="flex h-16 items-center px-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">PG Admin</h1>
            </div>

            <nav className="mt-6 px-3">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/');
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
          </div>

          {/* Main content */}
          <div className="pl-64">
            <main className="py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

