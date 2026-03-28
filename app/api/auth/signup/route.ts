import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(request: NextRequest) {
  const {
    email,
    password,
    name,
    mobile,
    role = 'TENANT',
  } = await request.json();
  const supabase = createClient();

  // Sign up user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        mobile,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    try {
      // Create user in our database
      await prisma.user.create({
        data: {
          id: data.user.id,
          name,
          mobile,
          email,
          role: role as 'ADMIN' | 'TENANT' | 'OWNER',
        },
      });
    } catch (dbError) {
      console.error('Error creating user in database:', dbError);
      // User was created in Supabase but not in our DB
      // You might want to handle this case appropriately
    }
  }

  return NextResponse.json(
    { user: data.user, message: 'Check your email to confirm your account' },
    { status: 200 },
  );
}
