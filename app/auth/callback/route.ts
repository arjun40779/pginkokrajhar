import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin/dashboard';

  if (code) {
    // Create a response object to handle cookies properly
    let response = NextResponse.redirect(`${origin}${next}`);

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

    if (!error && data.user) {
      // Check if user exists in our database, create if not
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: data.user.id },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: data.user.id,
              name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                data.user.email?.split('@')[0], // fallback to email prefix
              mobile: data.user.user_metadata?.phone || '',
              email: data.user.email,
              role: 'TENANT',
            },
          });
          console.log('Created new user:', data.user.id);
        } else {
          console.log('Existing user logged in:', data.user.id);
        }
      } catch (dbError) {
        console.error('Error syncing user with database:', dbError);
      }

      // Make sure session is properly established
      await supabase.auth.getSession();

      return response;
    } else {
      console.error('OAuth callback error:', error);
      response = NextResponse.redirect(
        `${origin}/auth/login?error=oauth_failed`,
      );
    }
  } else {
    console.error('No authorization code received in OAuth callback');
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=oauth_callback_error`,
  );
}

