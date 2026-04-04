function normalizeSlug(
  slug: string | { current?: string } | null | undefined,
): string | null {
  const rawSlug = typeof slug === 'string' ? slug : slug?.current;
  const trimmedSlug = rawSlug?.trim();

  return trimmedSlug || null;
}

export function getPGRoomsPath(
  slug: string | { current?: string } | null | undefined,
  fallbackDbId?: string | null,
): string {
  const normalizedSlug = normalizeSlug(slug);

  if (normalizedSlug) {
    return `/pgs/${normalizedSlug}/rooms`;
  }

  if (fallbackDbId?.trim()) {
    return `/pg/${fallbackDbId.trim()}`;
  }

  return '/pgs';
}

