export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';

async function getOrCreateUserProfile(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any> | null;
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: authUser.id,
    },
  });

  if (user) {
    return user;
  }

  const metadata = authUser.user_metadata ?? {};
  const name =
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    authUser.email ||
    null;
  const mobile =
    (metadata.mobile as string | undefined) ||
    (metadata.phone as string | undefined) ||
    '';

  return prisma.user.create({
    data: {
      id: authUser.id,
      name,
      mobile,
      email: authUser.email,
      role: 'TENANT',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('Profile API: Starting request...');

    const supabase = createClient();
    console.log('Profile API: Supabase client created');

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Profile API: Auth check result:', {
      hasUser: !!authUser,
      userId: authUser?.id,
      authError: authError?.message,
    });

    if (authError || !authUser) {
      console.log('Profile API: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(
      'Profile API: Attempting database query for user:',
      authUser.id,
    );

    const user = await getOrCreateUserProfile(authUser);

    console.log('Profile API: Database query result:', {
      hasUser: !!user,
      userId: user?.id,
    });

    console.log('Profile API: Returning user data successfully');
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, mobile } = await request.json();

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {
        name,
        mobile,
        email: authUser.email,
      },
      create: {
        id: authUser.id,
        name,
        mobile,
        email: authUser.email,
        role: 'TENANT', // Default role
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

