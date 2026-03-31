'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Bed,
  Users,
  MessageSquare,
  Calendar,
  LogOut,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';

type AdminPanelProps = {
  children: React.ReactNode;
};

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'PGs', href: '/admin/pgs', icon: Building2 },
  { name: 'Rooms', href: '/admin/rooms', icon: Bed },
  { name: 'Tenants', href: '/admin/tenants', icon: Users },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
];

export default function AdminPanel({ children }: Readonly<AdminPanelProps>) {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();

  const currentSection =
    navigation.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
    ) ?? navigation[0];

  const initials = (userProfile?.name || user?.email || 'A')
    .split(' ')
    .map((value) => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16  gap-4 py-4 flex-row items-center justify-between   lg:py-0 ">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  PG Management
                </h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end lg:self-auto">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.name || user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <span className="font-semibold text-blue-600">{initials}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500">Admin workspace</p>
          <h2 className="text-2xl font-semibold text-gray-900">
            {currentSection.name}
          </h2>
        </div>

        <nav className="mb-8 flex gap-2 overflow-x-auto border-b border-gray-200 pb-px">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-b-2 border-blue-600 text-blue-600 -mb-px'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}

