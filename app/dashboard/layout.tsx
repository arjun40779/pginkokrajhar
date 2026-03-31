import '../globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata = {
  title: 'Dashboard - PG Inkokrajhar',
  description: 'Your PG dashboard',
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

