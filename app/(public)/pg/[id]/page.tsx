import { notFound } from 'next/navigation';
import { getPGByDbId } from '@/lib/sanity/queries/pgSection';
import { PGDetailClient } from '@/components/pages/PGDetailClient';

export const revalidate = 60;

interface Props {
  params: Readonly<{ id: string }>;
}

export default async function PGDetailPage({ params }: Readonly<Props>) {
  const pg = await getPGByDbId(params.id);

  if (!pg) {
    notFound();
  }

  return <PGDetailClient pg={pg} dbId={params.id} />;
}
