export function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');
}

export function buildRoomSlug(
  pgSlugOrName: string,
  roomNumber: string,
): string {
  return slugifySegment(`${pgSlugOrName}-${roomNumber}`);
}
