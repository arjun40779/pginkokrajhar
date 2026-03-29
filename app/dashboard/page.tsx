'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {userProfile?.name || 'Not set'}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Mobile:</strong> {userProfile?.mobile || 'Not set'}
                </p>
                <p>
                  <strong>Role:</strong> {userProfile?.role || 'TENANT'}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {userProfile?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push('/admin/dashboard')}
                variant="outline"
              >
                Go to Admin Dashboard
              </Button>
              <Button
                className="w-full"
                onClick={() => router.push('/resident-portal')}
                variant="outline"
              >
                Resident Portal
              </Button>
              <Button
                className="w-full"
                onClick={() => router.push('/rooms')}
                variant="outline"
              >
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
