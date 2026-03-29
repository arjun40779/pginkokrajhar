import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

// Real-time room availability for a single PG (rooms + occupancy)
export interface RoomAvailability {
  id: string;
  roomNumber: string;
  roomType: string;
  maxOccupancy: number;
  currentOccupancy: number;
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
}

export interface PGAvailability {
  id: string;
  totalRooms: number;
  availableRooms: number;
  rooms: RoomAvailability[];
}

// Cache availability for 30 seconds, revalidate on focus
const SWR_OPTS = {
  refreshInterval: 30_000,
  revalidateOnFocus: true,
  dedupingInterval: 10_000,
};

export function usePGAvailability(pgDbId: string | null) {
  const { data, error, isLoading } = useSWR<PGAvailability>(
    pgDbId ? `/api/pg/${pgDbId}/availability` : null,
    fetcher,
    SWR_OPTS,
  );
  return { availability: data ?? null, error, isLoading };
}

// Validate a specific room before booking (real-time price + status)
export interface BookingValidation {
  valid: boolean;
  pgId: string;
  roomId: string;
  roomNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  availabilityStatus: string;
  reason?: string;
}

export function useBookingValidation(pgId: string | null, roomId: string | null) {
  const key =
    pgId && roomId
      ? `/api/booking/validate?pgId=${pgId}&roomId=${roomId}`
      : null;
  const { data, error, isLoading, mutate } = useSWR<BookingValidation>(
    key,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5_000 },
  );
  return { validation: data ?? null, error, isLoading, revalidate: mutate };
}
