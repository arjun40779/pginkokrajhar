import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
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
                data.user.user_metadata?.name,
              mobile: data.user.user_metadata?.phone || '',
              email: data.user.email,
              role: 'TENANT',
            },
          });
        }
      } catch (dbError) {
        console.error('Error syncing user with database:', dbError);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
