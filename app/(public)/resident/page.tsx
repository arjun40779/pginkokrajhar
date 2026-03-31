import { redirect } from 'next/navigation';
import ResidentDashboard from '@/components/pages/ResidentDashboard';
import { getResidentDashboardData } from '@/lib/resident/getResidentDashboardData';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ResidentPage() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login?next=/resident');
  }

  const dashboardData = await getResidentDashboardData({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  });

  if (dashboardData.profile?.role === 'ADMIN') {
    redirect('/admin/dashboard');
  }

  if (dashboardData.profile?.role && dashboardData.profile.role !== 'TENANT') {
    redirect('/unauthorized');
  }

  return (
    <main>
      <ResidentDashboard
        dashboardData={dashboardData}
        viewerEmail={user.email ?? null}
      />
    </main>
  );
}
