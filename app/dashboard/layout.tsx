import '../globals.css';

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
      <body>{children}</body>
    </html>
  );
}

