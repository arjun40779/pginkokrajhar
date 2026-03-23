'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { verifyOTP } from '@/lib/firebase/verifyOpt';
import { sendOTP } from '@/lib/firebase/sendOpt';

// Extend window object to include grecaptcha
declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get('mobile');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load confirmation result and registration data from sessionStorage
  useEffect(() => {
    const savedConfirmation = sessionStorage.getItem('confirmationResult');
    if (savedConfirmation) {
      try {
        const parsed = JSON.parse(savedConfirmation);
        setConfirmationResult(parsed);
      } catch (error) {
        console.error('Failed to parse confirmation result:', error);
      }
    }

    const savedRegistrationData = sessionStorage.getItem('registrationData');
    if (savedRegistrationData) {
      try {
        const parsed = JSON.parse(savedRegistrationData);
        setRegistrationData(parsed);
      } catch (error) {
        console.error('Failed to parse registration data:', error);
      }
    }
  }, []);

  // Countdown for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Redirect if no mobile number
  useEffect(() => {
    if (!mobile) {
      router.push('/login');
    }
  }, [mobile, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      setError('No confirmation result found. Please try logging in again.');
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify OTP using Firebase
      const token = await verifyOTP(confirmationResult, otpCode);

      // Call backend API to authenticate/create user
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          registrationData: registrationData, // Send registration data if exists
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear stored confirmation result
        sessionStorage.removeItem('confirmationResult');

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Verification failed. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setError(error?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!mobile) {
      setError('Mobile number not found. Please try logging in again.');
      return;
    }

    setResendLoading(true);
    try {
      // Execute reCAPTCHA Enterprise before resending OTP
      let recaptchaToken = null;
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
        try {
          recaptchaToken = await window.grecaptcha.enterprise.execute(
            '6LctBpAsAAAAAKZqoO0aFZWx4g9IpOnMRmfGuY40',
            { action: 'RESEND_OTP' },
          );
          console.log('reCAPTCHA token for resend:', recaptchaToken);
        } catch (recaptchaError) {
          console.warn('reCAPTCHA failed:', recaptchaError);
          // Continue without reCAPTCHA if it fails
        }
      }

      // Resend OTP using Firebase
      const phoneNumber = `+91${mobile}`;
      const confirmation = await sendOTP(phoneNumber);

      // Update stored confirmation result
      sessionStorage.setItem(
        'confirmationResult',
        JSON.stringify({
          verificationId: confirmation.verificationId,
          mobile: mobile,
        }),
      );

      setConfirmationResult(confirmation);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      setError(error?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!mobile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Verify your mobile number
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter the 6-digit OTP sent to{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            +91 {mobile}
          </span>
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Enter OTP
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleOtpChange(index, e.target.value.replace(/\D/g, ''))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-12 h-12 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200
                  ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                `}
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 justify-center mt-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            Demo: Use <span className="font-mono font-semibold">123456</span> as
            OTP
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={otp.join('').length !== 6}
        >
          Verify OTP
        </Button>
      </form>

      {/* Resend OTP */}
      <div className="text-center space-y-3">
        {countdown > 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Resend OTP in{' '}
            <span className="font-semibold text-blue-600">{countdown}s</span>
          </p>
        ) : (
          <Button
            variant="outline"
            onClick={handleResendOtp}
            loading={resendLoading}
            className="text-sm"
          >
            Resend OTP
          </Button>
        )}
      </div>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200 text-sm"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  );
}

