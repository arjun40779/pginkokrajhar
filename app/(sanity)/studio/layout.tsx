import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Sanity Studio - PG Management',
  description: 'Content management for PG website',
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {/* Clean layout for Sanity Studio - no header/footer */}
        {children}
      </body>
    </html>
  );
}

