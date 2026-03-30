import { getAllRooms } from '@/lib/sanity/queries/roomSection';
import { Rooms } from '@/components/pages/Rooms';

// Revalidate content every 60 seconds (ISR)
export const revalidate = 60;

export default async function RoomsPage() {
  const rooms = await getAllRooms();
  return <Rooms data={rooms} />;
}

