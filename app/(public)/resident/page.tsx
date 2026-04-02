import ResidentDashboard from '@/components/pages/ResidentDashboard';
import { getResidentDashboardData } from '@/lib/resident/getResidentDashboardData';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ResidentPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dashboardData = await getResidentDashboardData({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  });

  return (
    <main>
      <ResidentDashboard
        dashboardData={dashboardData}
        viewerEmail={user.email ?? null}
      />
    </main>
  );
}

