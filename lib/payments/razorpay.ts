import Razorpay from 'razorpay';

function readEnv(name: 'RAZORPAY_KEY_ID' | 'RAZORPAY_KEY_SECRET') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function getRazorpayKeyId() {
  return readEnv('RAZORPAY_KEY_ID');
}

export function getRazorpayKeySecret() {
  return readEnv('RAZORPAY_KEY_SECRET');
}

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}

export function getRazorpayClient() {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });
}
