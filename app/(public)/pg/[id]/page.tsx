import { notFound } from 'next/navigation';
import { getActiveContactDetails } from '@/lib/sanity/queries/contactDetails';
import { getPGByDbId } from '@/lib/sanity/queries/pgSection';
import { PGDetailClient } from '@/components/pages/PGDetailClient';

export const revalidate = 60;

interface Props {
  params: Readonly<{ id: string }>;
}

export default async function PGDetailPage({ params }: Readonly<Props>) {
  const [pg, contactDetails] = await Promise.all([
    getPGByDbId(params.id),
    getActiveContactDetails(),
  ]);

  if (!pg) {
    notFound();
  }

  return (
    <PGDetailClient pg={pg} dbId={params.id} contactDetails={contactDetails} />
  );
}

