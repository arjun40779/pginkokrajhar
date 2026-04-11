export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/prisma';
async function resolveCanonicalUser(
  authUser: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, any> | null;
  },
  authEmail: string | null,
  authMobile: string | null,
) {
  const metadata = authUser.user_metadata ?? {};

  const candidates = await prisma.user.findMany({
    where: {
      OR: [
        { id: authUser.id },
        ...(authEmail ? [{ email: authEmail }] : []),
        ...(authMobile ? [{ mobile: authMobile }] : []),
      ],
    },
  });

  let canonicalUser =
    candidates.find((candidate) => candidate.id === authUser.id) ?? null;

  if (canonicalUser === null) {
    const name =
      (metadata.full_name as string | undefined) ||
      (metadata.name as string | undefined) ||
      authEmail ||
      null;

    canonicalUser = await prisma.user.create({
      data: {
        id: authUser.id,
        name,
        mobile: authMobile ?? '',
        email: authEmail,
        roles: ['TENANT'],
        isActive: true,
      },
    });

    return { canonicalUser, guestUsers: candidates };
  }

  const updatedName =
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    canonicalUser.name;

  const updatedMobile = authMobile ?? canonicalUser.mobile;
  const updatedEmail = authEmail ?? canonicalUser.email;

  if (
    updatedName !== canonicalUser.name ||
    updatedMobile !== canonicalUser.mobile ||
    updatedEmail !== canonicalUser.email ||
    !canonicalUser.isActive
  ) {
    canonicalUser = await prisma.user.update({
      where: { id: canonicalUser.id },
      data: {
        name: updatedName,
        mobile: updatedMobile,
        email: updatedEmail,
        isActive: true,
      },
    });
  }

  const guestUsers = candidates.filter(
    (candidate) => candidate.id !== authUser.id,
  );
  return { canonicalUser, guestUsers };
}

async function mergeGuestUsersIntoCanonical(
  canonicalUserId: string,
  guestUsers: Array<{ id: string; isActive: boolean }>,
) {
  if (guestUsers.length === 0) {
    return;
  }

  const canonicalTenant = await prisma.tenant.findFirst({
    where: { userId: canonicalUserId },
  });

  for (const guest of guestUsers) {
    const guestTenants = await prisma.tenant.findMany({
      where: { userId: guest.id },
    });

    if (guestTenants.length > 0 && !canonicalTenant) {
      await prisma.tenant.updateMany({
        where: { userId: guest.id },
        data: { userId: canonicalUserId },
      });
    }

    if (guest.isActive) {
      await prisma.user.update({
        where: { id: guest.id },
        data: { isActive: false },
      });
    }
  }
}

async function getOrCreateMergedUserProfile(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any> | null;
}) {
  const metadata = authUser.user_metadata ?? {};
  const authEmail = authUser.email ?? null;
  const authMobile =
    (metadata.mobile as string | undefined) ||
    (metadata.phone as string | undefined) ||
    null;

  const { canonicalUser, guestUsers } = await resolveCanonicalUser(
    authUser,
    authEmail,
    authMobile,
  );

  await mergeGuestUsersIntoCanonical(
    canonicalUser.id,
    guestUsers.map((guest) => ({ id: guest.id, isActive: guest.isActive })),
  );

  return canonicalUser;
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
      'Profile API: Attempting database query and merge for user:',
      authUser.id,
    );

    const user = await getOrCreateMergedUserProfile(authUser);

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
        roles: ['TENANT'],
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

