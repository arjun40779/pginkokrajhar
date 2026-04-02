export const studioUrl = '/studio';
export const previewModeEnablePath = '/api/draft-mode/enable';
export const previewModeDisablePath = '/api/draft-mode/disable';
export const previewPerspectiveCookieName = 'sanity-preview-perspective';
export const previewSecretParam = 'sanity-preview-secret';
export const previewPathnameParam = 'sanity-preview-pathname';
export const previewPerspectiveParam = 'sanity-preview-perspective';

const defaultPreviewOrigin =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const previewSecretQuery = `*[_type == "sanity.previewUrlSecret" && secret == $secret && dateTime(_updatedAt) > dateTime(now()) - 3600][0]{
  _id,
  _updatedAt,
  secret,
  studioUrl,
}`;

export const sharedPreviewSecretQuery = `*[_id == "sanity-preview-url-secret.share-access" && _type == "sanity.previewUrlShareAccess" && secret == $secret][0]{
  secret,
  studioUrl,
}`;

export function getPresentationAllowOrigins(): string[] {
  return Array.from(
    new Set(
      [defaultPreviewOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000']
        .map((origin) => origin?.trim())
        .filter((origin): origin is string => Boolean(origin)),
    ),
  );
}

export function getPresentationPreviewUrl() {
  return {
    initial: defaultPreviewOrigin,
    previewMode: {
      enable: previewModeEnablePath,
      disable: previewModeDisablePath,
    },
  };
}

export function sanitizeRedirectPath(
  rawPath?: string | null,
  fallback = '/',
): string {
  if (!rawPath) {
    return fallback;
  }

  try {
    const url = new URL(rawPath, 'http://localhost');

    if (url.origin !== 'http://localhost') {
      return fallback;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function getPreviewRequestParams(requestUrl: string) {
  const url = new URL(requestUrl);

  return {
    secret: url.searchParams.get(previewSecretParam),
    redirectTo: sanitizeRedirectPath(
      url.searchParams.get(previewPathnameParam),
    ),
    perspective: url.searchParams.get(previewPerspectiveParam),
  };
}

export function resolvePageHref(slug?: string | null): string {
  if (!slug || slug === 'home' || slug === '/home') {
    return '/';
  }

  const normalized = slug.startsWith('/') ? slug : `/${slug}`;
  return normalized === '/index' ? '/' : normalized;
}
