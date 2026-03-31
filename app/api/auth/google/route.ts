export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const redirectTo =
    searchParams.get('redirectTo') ||
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ url: data.url }, { status: 200 });
}

