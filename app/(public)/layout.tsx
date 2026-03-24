import '../globals.css';
import Script from 'next/script';
import { getLayoutSection } from '@/lib/sanity/queries/getLayoutSection';
import { LayoutContent } from './LayoutContent';

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
        {/* reCAPTCHA Enterprise Script */}
        <Script src="https://www.google.com/recaptcha/enterprise.js?render=6LcyBpAsAAAAAO6OUHgkuJMpmxKerDgmu2Ff0TuH" />
      </head>
      <body className="min-h-full flex flex-col">
        <LayoutContent layoutData={layoutData}>{children}</LayoutContent>
      </body>
    </html>
  );
}

