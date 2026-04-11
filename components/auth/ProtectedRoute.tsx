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

function hasAnyRole(
  userRoles: Array<'ADMIN' | 'TENANT' | 'OWNER'>,
  allowed: Array<'ADMIN' | 'TENANT' | 'OWNER'>,
) {
  return userRoles.some((r) => allowed.includes(r));
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

      if (userProfile && !hasAnyRole(userProfile.roles, allowedRoles)) {
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

  if (!user || (userProfile && !hasAnyRole(userProfile.roles, allowedRoles))) {
    return null;
  }

  return <>{children}</>;
}

