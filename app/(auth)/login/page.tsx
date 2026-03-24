'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { sendOTP } from '@/lib/firebase/sendOpt';

// Extend window object to include grecaptcha
declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      // Execute reCAPTCHA Enterprise before sending OTP
      let recaptchaToken = null;
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
        try {
          recaptchaToken = await window.grecaptcha.enterprise.execute(
            '6LctBpAsAAAAAKZqoO0aFZWx4g9IpOnMRmfGuY40',
            { action: 'LOGIN' },
          );
        } catch (recaptchaError) {
          console.warn('reCAPTCHA failed:', recaptchaError);
          // Continue without reCAPTCHA if it fails
        }
      }

      // Send OTP using Firebase
      const phoneNumber = `+91${mobile}`;
      const confirmation = await sendOTP(phoneNumber);

      // Store confirmation result for verification
      sessionStorage.setItem(
        'confirmationResult',
        JSON.stringify({
          verificationId: confirmation.verificationId,
          mobile: mobile,
        }),
      );

      // Redirect to OTP verification page with mobile number
      router.push(`/verify?mobile=${mobile}`);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      setError(error?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 w-full">
      {/* Logo/Brand Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-blue-500">PG Connect</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Log In to your Account
        </h2>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">+91</span>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="Enter Here"
              className={`
                block w-full pl-12 pr-3 py-3 border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors duration-200
                ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50
              `}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          loading={loading}
          disabled={mobile.length !== 10}
        >
          Continue
        </Button>
      </form>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
        By clicking on proceed, you have read and agree to the PG Connect{' '}
        <Link href="/terms" className="text-blue-500 hover:underline">
          Terms of Use
        </Link>{' '}
        &{' '}
        <Link href="/privacy" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      {/* Register Link */}
      <div className="text-center mt-8">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-blue-500 hover:text-blue-600 font-medium underline"
          >
            Create new account now.
          </Link>
        </p>
      </div>

      {/* Mobile responsive - Show welcome text on small screens */}
      <div className="lg:hidden mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Welcome to PG Connect! 👋
        </h3>
        <p className="text-sm text-blue-600">
          "Finding Home, Simplifying Lives" - Your trusted platform for PG
          bookings and property management.
        </p>
      </div>
    </div>
  );
}

