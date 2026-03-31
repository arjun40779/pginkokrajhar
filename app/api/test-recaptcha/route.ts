export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify reCAPTCHA Enterprise tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recaptchaToken, action } = body;

    if (!recaptchaToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'reCAPTCHA token required',
        },
        { status: 400 },
      );
    }

    // Here you would normally verify the token with Google reCAPTCHA Enterprise API
    // For testing purposes, we'll just validate the format and return success
    console.log(
      'Received reCAPTCHA token:',
      recaptchaToken.substring(0, 50) + '...',
    );
    console.log('Action:', action);

    // Mock verification - replace with actual Google reCAPTCHA Enterprise API call
    const isValidToken =
      typeof recaptchaToken === 'string' && recaptchaToken.length > 100;

    if (!isValidToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reCAPTCHA token format',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'reCAPTCHA token verified successfully',
      data: {
        action,
        tokenLength: recaptchaToken.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify reCAPTCHA token',
      },
      { status: 500 },
    );
  }
}

