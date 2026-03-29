import { getAllPGs } from '@/lib/sanity/queries/pgSection';
import { RoomsClient } from '@/components/pages/RoomsClient';

// Revalidate content every 60 seconds (ISR)
export const revalidate = 60;

export default async function RoomsPage() {
  const pgs = await getAllPGs();
  return <RoomsClient initialPGs={pgs} />;
}

