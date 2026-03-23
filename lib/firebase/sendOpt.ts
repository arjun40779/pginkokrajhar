import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './client';

export const sendOTP = async (phone: string) => {
  // Use signInWithPhoneNumber without RecaptchaVerifier
  // reCAPTCHA Enterprise is handled separately in the UI
  const confirmation = await signInWithPhoneNumber(auth, phone);

  return confirmation;
};

