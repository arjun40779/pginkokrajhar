'use client';

import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const toasterStyle = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
} as CSSProperties;

const Toaster = (props: ToasterProps) => {
  return <Sonner className="toaster group" style={toasterStyle} {...props} />;
};

export { Toaster };

