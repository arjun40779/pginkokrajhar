'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';
import type { LayoutSection } from '@/sanity/types';

interface LayoutContentProps {
  layoutData: LayoutSection | null;
  children: React.ReactNode;
}

export function LayoutContent({ layoutData, children }: LayoutContentProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and ensure client-side hydration is complete
    const timer = setTimeout(() => {
      setIsClient(true);
      setIsLoading(false);
    }, 100); // Small delay to ensure hydration is complete

    return () => clearTimeout(timer);
  }, []);

  // Show full page skeleton during SSR and initial hydration
  if (!isClient || isLoading) {
    return <FullPageSkeleton />;
  }
  console.log(layoutData);

  return (
    <>
      {layoutData?.header ? (
        <Header headerData={layoutData.header as any} />
      ) : null}

      {children}

      {layoutData?.footer ? (
        <Footer footerData={layoutData.footer as any} />
      ) : null}

      {/* Mobile Bottom Padding - to prevent content from being hidden behind bottom nav */}
      <div className="md:hidden h-16" />
    </>
  );
}

