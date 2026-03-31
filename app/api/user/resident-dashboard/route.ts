export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getResidentDashboardData } from '@/lib/resident/getResidentDashboardData';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const residentDashboard = await getResidentDashboardData({
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
    });

    return NextResponse.json(residentDashboard);
  } catch (error) {
    console.error('Error fetching resident dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

