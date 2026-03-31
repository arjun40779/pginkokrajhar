'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'ADMIN' | 'TENANT' | 'OWNER'>;
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ['ADMIN', 'TENANT', 'OWNER'],
  redirectTo = '/auth/login',
  unauthorizedRedirectTo = '/unauthorized',
}: Readonly<ProtectedRouteProps>) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(redirectTo);
        return;
      }

      if (userProfile && !allowedRoles.includes(userProfile.role)) {
        router.replace(unauthorizedRedirectTo);
        return;
      }
    }
  }, [
    user,
    userProfile,
    loading,
    router,
    allowedRoles,
    redirectTo,
    unauthorizedRedirectTo,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user || (userProfile && !allowedRoles.includes(userProfile.role))) {
    return null;
  }

  return <>{children}</>;
}

