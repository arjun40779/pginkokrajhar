import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

type AppRole = 'ADMIN' | 'TENANT' | 'OWNER';

function isResidentRoute(pathname: string) {
  return pathname === '/resident' || pathname.startsWith('/resident/');
}

function applyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

function getRequestCookieHeader(request: NextRequest) {
  return request.cookies
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

async function getAuthenticatedUserRole(request: NextRequest) {
  const profileUrl = new URL('/api/user/profile', request.url);
  const response = await fetch(profileUrl, {
    headers: {
      cookie: getRequestCookieHeader(request),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const profile = (await response.json()) as { role?: AppRole };

  return profile.role ?? null;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!isResidentRoute(pathname)) {
    return response;
  }

  const location = response.headers.get('location');
  if (location) {
    return response;
  }

  const role = await getAuthenticatedUserRole(request);

  if (role === 'ADMIN') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/dashboard';
    redirectUrl.search = '';

    return applyResponseCookies(response, NextResponse.redirect(redirectUrl));
  }

  if (role && role !== 'TENANT') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/unauthorized';
    redirectUrl.search = '';

    return applyResponseCookies(response, NextResponse.redirect(redirectUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    String.raw`/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
  ],
};

