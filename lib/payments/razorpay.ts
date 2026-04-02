import Razorpay from 'razorpay';

function readEnv(
  primaryName: 'RAZORPAY_KEY_ID' | 'RAZORPAY_KEY_SECRET',
  legacyName: 'RZORPAY_KEY_ID' | 'RZORPAY_KEY_SECRET',
) {
  const value = process.env[primaryName] ?? process.env[legacyName];

  if (!value) {
    throw new Error(
      `${primaryName} is not configured (legacy ${legacyName} is also missing)`,
    );
  }

  return value;
}

export function getRazorpayKeyId() {
  return readEnv('RAZORPAY_KEY_ID', 'RZORPAY_KEY_ID');
}

export function getRazorpayKeySecret() {
  return readEnv('RAZORPAY_KEY_SECRET', 'RZORPAY_KEY_SECRET');
}

export function isRazorpayConfigured() {
  return Boolean(
    (process.env.RAZORPAY_KEY_ID ?? process.env.RZORPAY_KEY_ID) &&
    (process.env.RAZORPAY_KEY_SECRET ?? process.env.RZORPAY_KEY_SECRET),
  );
}

export function getRazorpayClient() {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });
}

