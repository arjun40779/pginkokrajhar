export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/prisma';
import {
  getContactFormToEmail,
  getResendClient,
  getResendFromEmail,
  isResendConfigured,
} from '@/lib/email/resend';

const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.email('Valid email is required').max(255),
  phone: z.string().trim().min(10, 'Valid phone number is required').max(30),
  subject: z.string().trim().min(3, 'Subject is required').max(150),
  message: z.string().trim().min(10, 'Message is required').max(5000),
});

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildEmailText(data: z.infer<typeof contactFormSchema>) {
  return [
    'New contact form submission',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Subject: ${data.subject}`,
    '',
    'Message:',
    data.message,
  ].join('\n');
}

function buildEmailHtml(data: z.infer<typeof contactFormSchema>) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 16px">New contact form submission</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tr>
          <td style="padding:8px 0;font-weight:600;width:120px">Name</td>
          <td style="padding:8px 0">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600">Email</td>
          <td style="padding:8px 0">${escapeHtml(data.email)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600">Phone</td>
          <td style="padding:8px 0">${escapeHtml(data.phone)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:600">Subject</td>
          <td style="padding:8px 0">${escapeHtml(data.subject)}</td>
        </tr>
      </table>
      <div style="margin-top:24px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb">
        <p style="margin:0 0 8px;font-weight:600">Message</p>
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(data.message)}</p>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactFormSchema.parse(body);

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email,
        message: `Subject: ${validatedData.subject}\n\n${validatedData.message}`,
        source: 'contact-form',
      },
    });

    if (!isResendConfigured()) {
      return NextResponse.json(
        {
          success: true,
          inquiryId: inquiry.id,
          emailSent: false,
          warning: 'Inquiry saved, but email service is not configured',
        },
        { status: 201 },
      );
    }

    const resend = getResendClient();
    const response = await resend.emails.send({
      from: getResendFromEmail(),
      to: [getContactFormToEmail()],
      replyTo: validatedData.email,
      subject: `Contact Form: ${validatedData.subject}`,
      text: buildEmailText(validatedData),
      html: buildEmailHtml(validatedData),
    });

    if (response.error) {
      console.error('Error sending contact form email:', response.error);
      return NextResponse.json(
        {
          success: true,
          inquiryId: inquiry.id,
          emailSent: false,
          warning:
            response.error.message ||
            'Inquiry saved, but email delivery failed',
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        inquiryId: inquiry.id,
        emailSent: true,
        emailId: response.data?.id ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error handling contact form submission:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500 },
    );
  }
}

