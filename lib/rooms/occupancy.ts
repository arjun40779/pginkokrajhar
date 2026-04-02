export const ROOM_TYPE_MIN_OCCUPANCY = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  DORMITORY: 4,
} as const;

export type SupportedRoomType = keyof typeof ROOM_TYPE_MIN_OCCUPANCY;

export function getMinimumOccupancyForRoomType(roomType: SupportedRoomType) {
  return ROOM_TYPE_MIN_OCCUPANCY[roomType];
}

export function normalizeMaxOccupancy(
  roomType: SupportedRoomType,
  maxOccupancy: number,
) {
  return Math.max(maxOccupancy, getMinimumOccupancyForRoomType(roomType));
}
