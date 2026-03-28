'use client';

import { AuthProvider } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

function DashboardHeader() {
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
            <span className="text-gray-600  ">Dashboard</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {userProfile?.name || user?.email}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {userProfile?.role || 'User'}
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

function DashboardContent() {
  return (
    <ProtectedRoute allowedRoles={['TENANT', 'OWNER']}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main>
          <UserDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

