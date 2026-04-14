import RoomManagement from '@/components/admin/RoomManagement';

export const dynamic = 'force-dynamic';

export default async function AdminRoomsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ pgId?: string }>;
}>) {
  const { pgId } = await searchParams;
  return <RoomManagement pgId={pgId} />;
}

