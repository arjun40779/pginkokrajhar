import Razorpay from 'razorpay';

export type RazorpayConfig = {
  keyId: string;
};

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

export function getDefaultRazorpayConfig(): RazorpayConfig {
  return {
    keyId: readEnv('RAZORPAY_KEY_ID', 'RZORPAY_KEY_ID'),
  };
}

export function getRazorpayKeyId(config?: RazorpayConfig) {
  if (config) {
    return config.keyId;
  }

  return getDefaultRazorpayConfig().keyId;
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

export function getRazorpayClient(config?: RazorpayConfig) {
  const effectiveConfig = config ?? getDefaultRazorpayConfig();

  return new Razorpay({
    key_id: effectiveConfig.keyId,
    key_secret: getRazorpayKeySecret(),
  });
}

