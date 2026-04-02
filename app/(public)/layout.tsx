import '../globals.css';
import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity';
import { getLayoutSection } from '@/lib/sanity/queries/getLayoutSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch layout data from Sanity (includes header and footer references) - SERVER SIDE
  const layoutData = await getLayoutSection();
  const isDraftMode = draftMode().isEnabled;

  return (
    <html lang="en" className="h-full antialiased">
      <head />
      <body className="min-h-full flex flex-col">
        {layoutData?.header ? (
          <Header headerData={layoutData.header as any} />
        ) : null}
        {children}

        {layoutData?.footer ? (
          <Footer footerData={layoutData.footer as any} />
        ) : null}

        {/* Mobile Bottom Padding - to prevent content from being hidden behind bottom nav */}
        <div className="md:hidden h-16" />
        <Toaster closeButton richColors position="top-center" />
        {isDraftMode ? <VisualEditing /> : null}
      </body>
    </html>
  );
}

