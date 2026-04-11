import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

type AppRole = 'ADMIN' | 'TENANT' | 'OWNER';

function normalizeNextPath(next: string | null) {
  if (!next?.startsWith('/')) {
    return null;
  }

  return next;
}

function getDefaultDestination(origin: string) {
  return `${origin}/resident`;
}

async function syncUserRoles(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existingUser) {
    console.log('Existing user logged in:', user.id);
    return existingUser.roles as AppRole[];
  }

  await prisma.user.create({
    data: {
      id: user.id,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0],
      mobile: user.user_metadata?.phone || '',
      email: user.email,
      roles: ['TENANT'],
    },
  });

  console.log('Created new user:', user.id);
  return ['TENANT'] as AppRole[];
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = normalizeNextPath(searchParams.get('next'));

  if (!code) {
    console.error('No authorization code received in OAuth callback');
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  // Create a response object to handle cookies properly
  const response = NextResponse.redirect(`${origin}/resident`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }

  try {
    await syncUserRoles({
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
    });

    const destination = requestedNext
      ? `${origin}${requestedNext}`
      : getDefaultDestination(origin);

    response.headers.set('location', destination);
  } catch (dbError) {
    console.error('Error syncing user with database:', dbError);
  }

  // Make sure session is properly established
  await supabase.auth.getSession();

  return response;
}

