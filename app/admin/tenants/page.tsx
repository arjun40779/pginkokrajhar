import TenantManagement from '@/components/admin/TenantManagement';

export const dynamic = 'force-dynamic';

export default async function AdminTenantsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ pgId?: string }>;
}>) {
  const { pgId } = await searchParams;
  return <TenantManagement pgId={pgId} />;
}

