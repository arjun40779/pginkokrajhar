import { notFound, redirect } from 'next/navigation';
import { getPGRoomsPath } from '@/lib/pgs/publicPath';
import { getPGByDbId } from '@/lib/sanity/queries/pgSection';

export const revalidate = 60;

interface Props {
  params: Readonly<{ id: string }>;
}

export default async function PGDetailPage({ params }: Readonly<Props>) {
  const pg = await getPGByDbId(params.id);

  if (!pg) {
    notFound();
  }

  redirect(getPGRoomsPath(pg.slug, params.id));
}

