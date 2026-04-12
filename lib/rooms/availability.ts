// Rooms with these statuses can be booked.
// VACANT is treated as AVAILABLE — they are functionally identical.
const BOOKABLE_ROOM_STATUSES = new Set(['AVAILABLE', 'VACANT']);
const BLOCKED_ROOM_STATUSES = new Set(['OCCUPIED', 'MAINTENANCE', 'RESERVED']);

export function normalizeRoomAvailabilityStatus(
  status: string | null | undefined,
  currentOccupancy?: number | null,
  maxOccupancy?: number | null,
) {
  const normalizedStatus = (status ?? '').toUpperCase();

  if (BLOCKED_ROOM_STATUSES.has(normalizedStatus)) {
    return normalizedStatus;
  }

  if (
    typeof currentOccupancy === 'number' &&
    typeof maxOccupancy === 'number' &&
    maxOccupancy > 0 &&
    currentOccupancy >= maxOccupancy
  ) {
    return 'OCCUPIED';
  }

  if (BOOKABLE_ROOM_STATUSES.has(normalizedStatus)) {
    return 'AVAILABLE';
  }

  return normalizedStatus || 'AVAILABLE';
}

export function isRoomAvailableForBooking(
  status: string | null | undefined,
  currentOccupancy?: number | null,
  maxOccupancy?: number | null,
) {
  return (
    normalizeRoomAvailabilityStatus(status, currentOccupancy, maxOccupancy) ===
    'AVAILABLE'
  );
}

export function formatRoomAvailabilityLabel(
  status: string | null | undefined,
  currentOccupancy?: number | null,
  maxOccupancy?: number | null,
) {
  return normalizeRoomAvailabilityStatus(status, currentOccupancy, maxOccupancy)
    .toLowerCase()
    .split('_')
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ');
}

