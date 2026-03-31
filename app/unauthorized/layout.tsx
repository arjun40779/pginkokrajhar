import '../globals.css';

export const metadata = {
  title: 'Unauthorized - PG Inkokrajhar',
  description: 'Access denied',
};

export default function UnauthorizedLayout({
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

