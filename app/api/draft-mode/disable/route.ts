import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  previewPerspectiveCookieName,
  sanitizeRedirectPath,
} from '@/sanity/lib/visual-editing';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  draftMode().disable();

  const redirectTo = sanitizeRedirectPath(
    request.nextUrl.searchParams.get('redirectTo'),
  );
  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl));

  response.cookies.delete(previewPerspectiveCookieName);

  return response;
}
