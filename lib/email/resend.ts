import { Resend } from 'resend';

function readEnv(name: 'RESEND_API_KEY' | 'RESEND_FROM_EMAIL') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function extractEmailAddress(value: string) {
  const match = /<([^>]+)>/.exec(value);
  return match?.[1] ?? value;
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export function getResendClient() {
  return new Resend(readEnv('RESEND_API_KEY'));
}

export function getResendFromEmail() {
  return readEnv('RESEND_FROM_EMAIL');
}

export function getContactFormToEmail() {
  return (
    process.env.CONTACT_FORM_TO_EMAIL ??
    extractEmailAddress(getResendFromEmail())
  );
}

