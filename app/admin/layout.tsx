'use client';

import '@/app/globals.css';
import AdminPanel from '@/components/admin/AdminPanel';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/lib/auth/AuthContext';

function AdminLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminPanel>{children}</AdminPanel>
    </ProtectedRoute>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

