'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { sendOTP } from '@/lib/firebase/sendOpt';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    role: 'TENANT',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Execute reCAPTCHA Enterprise before sending OTP
      let recaptchaToken = null;
      if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
        try {
          recaptchaToken = await window.grecaptcha.enterprise.execute(
            '6LctBpAsAAAAAKZqoO0aFZWx4g9IpOnMRmfGuY40',
            { action: 'SIGNUP' },
          );
        } catch (recaptchaError) {
          console.warn('reCAPTCHA failed:', recaptchaError);
          // Continue without reCAPTCHA if it fails
        }
      }

      // Store user registration data for later use during verification
      sessionStorage.setItem(
        'registrationData',
        JSON.stringify({
          name: formData.name,
          role: formData.role,
        }),
      );

      // Send OTP using Firebase
      const phoneNumber = `+91${formData.mobile}`;
      const confirmation = await sendOTP(phoneNumber);

      // Store confirmation result for verification
      sessionStorage.setItem(
        'confirmationResult',
        JSON.stringify({
          verificationId: confirmation.verificationId,
          mobile: formData.mobile,
        }),
      );

      // Redirect to OTP verification page with mobile number
      router.push(`/verify?mobile=${formData.mobile}`);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      setErrors({
        general: error?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create your account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join us to get started with PG booking
        </p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleRegister} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.general}
            </p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          error={errors.name}
          leftIcon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        <Input
          label="Mobile Number"
          type="tel"
          value={formData.mobile}
          onChange={(e) =>
            handleInputChange(
              'mobile',
              e.target.value.replace(/\D/g, '').slice(0, 10),
            )
          }
          placeholder="Enter your 10-digit mobile number"
          error={errors.mobile}
          helperText="We'll send you an OTP to verify your number"
          leftIcon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('role', 'TENANT')}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${
                  formData.role === 'TENANT'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${formData.role === 'TENANT' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}
                >
                  {formData.role === 'TENANT' && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium">Tenant</div>
                  <div className="text-xs opacity-70">Looking for PG</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('role', 'ADMIN')}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${
                  formData.role === 'ADMIN'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${formData.role === 'ADMIN' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}
                >
                  {formData.role === 'ADMIN' && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium">Owner</div>
                  <div className="text-xs opacity-70">Managing PG</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          By creating an account, you agree to our{' '}
          <Link
            href="/terms"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Privacy Policy
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!formData.name.trim() || formData.mobile.length !== 10}
        >
          Create Account
        </Button>
      </form>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
            or
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

