import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { client } from '@/sanity/lib/client';
import {
  getPreviewRequestParams,
  previewPerspectiveCookieName,
  previewSecretQuery,
  sharedPreviewSecretQuery,
} from '@/sanity/lib/visual-editing';

export const dynamic = 'force-dynamic';

interface PreviewSecretDocument {
  secret?: string;
  studioUrl?: string | null;
}

const token = process.env.SANITY_API_READ_TOKEN;

const previewSecretClient = token
  ? client.withConfig({
      token,
      useCdn: false,
      stega: false,
      apiVersion: '2025-02-19',
      perspective: 'raw',
    })
  : null;

async function isValidPreviewSecret(secret: string): Promise<boolean> {
  if (!previewSecretClient) {
    return false;
  }

  const [privateSecret, sharedSecret] = await Promise.all([
    previewSecretClient.fetch<PreviewSecretDocument | null>(
      previewSecretQuery,
      {
        secret,
      },
    ),
    previewSecretClient.fetch<PreviewSecretDocument | null>(
      sharedPreviewSecretQuery,
      {
        secret,
      },
    ),
  ]);

  return privateSecret?.secret === secret || sharedSecret?.secret === secret;
}

export async function GET(request: NextRequest) {
  if (!token) {
    return new NextResponse('Missing SANITY_API_READ_TOKEN', { status: 500 });
  }

  const { secret, redirectTo, perspective } = getPreviewRequestParams(
    request.url,
  );

  if (!secret) {
    return new NextResponse('Missing preview secret', { status: 400 });
  }

  if (!(await isValidPreviewSecret(secret))) {
    return new NextResponse('Invalid preview secret', { status: 401 });
  }

  draftMode().enable();

  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl));

  if (perspective) {
    response.cookies.set(previewPerspectiveCookieName, perspective, {
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}
