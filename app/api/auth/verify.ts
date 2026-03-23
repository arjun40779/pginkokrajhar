import admin from '../../../lib/firebase/firebaseAdmin';
import { prisma } from '../../../prisma/';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token, registrationData } = await req.json();

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const phone = decoded.phone_number;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number not found in token' },
        { status: 400 },
      );
    }

    let user = await prisma.user.findUnique({
      where: { mobile: phone },
    });

    if (!user) {
      // Create new user with registration data if provided
      const userData: any = {
        mobile: phone,
        role: registrationData?.role || 'TENANT',
      };

      if (registrationData?.name) {
        userData.name = registrationData.name;
      }

      user = await prisma.user.create({
        data: userData,
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

