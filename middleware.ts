import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

type AppRole = 'ADMIN' | 'TENANT' | 'OWNER';

function isAdminRoute(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
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

async function getAuthenticatedUserRoles(request: NextRequest) {
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

  const profile = (await response.json()) as { roles?: AppRole[] };

  return profile.roles ?? null;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Only gate /admin routes
  if (!isAdminRoute(pathname)) {
    return response;
  }

  // If updateSession already issued a redirect, honour it
  const location = response.headers.get('location');
  if (location) {
    return response;
  }

  const roles = await getAuthenticatedUserRoles(request);

  // Not logged in → send to login with ?next= so they come back after auth
  if (!roles) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;

    return applyResponseCookies(response, NextResponse.redirect(loginUrl));
  }

  // Logged in but not an admin → unauthorized
  if (!roles.includes('ADMIN')) {
    const unauthorizedUrl = request.nextUrl.clone();
    unauthorizedUrl.pathname = '/unauthorized';
    unauthorizedUrl.search = '';

    return applyResponseCookies(
      response,
      NextResponse.redirect(unauthorizedUrl),
    );
  }

  return response;
}
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

