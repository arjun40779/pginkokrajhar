import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

// SWR config defaults: dedupe requests within 2s, revalidate on focus
const defaultConfig = {
  dedupingInterval: 2000,
  revalidateOnFocus: false,
  errorRetryCount: 2,
};

// Hook for admin dashboard stats
export function useAdminStats() {
  return useSWR('/api/admin/stats', fetcher, {
    ...defaultConfig,
    refreshInterval: 30000, // refresh every 30s
  });
}

// Hook for admin room list (room number, price, quantity)
export function useAdminRooms(pgId?: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (pgId) params.set('pgId', pgId);
  return useSWR(`/api/admin/rooms?${params}`, fetcher, defaultConfig);
}

// Hook for admin PG list
export function useAdminPGs(page = 1, limit = 20, search = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return useSWR(`/api/admin/pgs?${params}`, fetcher, defaultConfig);
}

// Hook for admin bookings
export function useAdminBookings(page = 1, status = '') {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);
  return useSWR(`/api/admin/bookings?${params}`, fetcher, defaultConfig);
}

// Hook for admin inquiries
export function useAdminInquiries(page = 1, status = '') {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);
  return useSWR(`/api/admin/inquiries?${params}`, fetcher, defaultConfig);
}

// Hook for real-time booking validation (price + availability from backend)
export function useBookingValidation(pgId?: string, roomId?: string) {
  const key = pgId || roomId
    ? `/api/bookings/validate?${new URLSearchParams({
        ...(pgId && { pgId }),
        ...(roomId && { roomId }),
      })}`
    : null;

  return useSWR(key, fetcher, {
    ...defaultConfig,
    revalidateOnFocus: true, // always revalidate price/availability
    refreshInterval: 10000, // refresh every 10s for real-time data
  });
}
