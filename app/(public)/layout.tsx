import '../globals.css';
import Script from 'next/script';
import { getLayoutSection } from '@/lib/sanity/queries/getLayoutSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch layout data from Sanity (includes header and footer references) - SERVER SIDE
  const layoutData = await getLayoutSection();

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* <Script src="https://www.google.com/recaptcha/enterprise.js?render=6LcyBpAsAAAAAO6OUHgkuJMpmxKerDgmu2Ff0TuH" /> */}
      </head>
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
      </body>
    </html>
  );
}

