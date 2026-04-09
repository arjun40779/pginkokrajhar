'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, IndianRupee, MapPin, Phone, Save, X } from 'lucide-react';

interface PGFormData {
  name: string;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  alternatePhone: string;
  startingPrice: number;
  securityDeposit: number;
  brokerageCharges: number;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayAccountId: string;
}

const initialFormData: PGFormData = {
  name: '',
  description: '',
  address: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  alternatePhone: '',
  startingPrice: 0,
  securityDeposit: 0,
  brokerageCharges: 0,
  razorpayKeyId: '',
  razorpayKeySecret: '',
  razorpayAccountId: '',
};

export default function CreatePGPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PGFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formattedStartingPrice = new Intl.NumberFormat('en-IN').format(
    formData.startingPrice || 0,
  );
  const formattedSecurityDeposit = new Intl.NumberFormat('en-IN').format(
    formData.securityDeposit || 0,
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = Number.parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'PG name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!formData.ownerName) newErrors.ownerName = 'Contact name is required';
    if (!formData.ownerPhone || formData.ownerPhone.length < 10) {
      newErrors.ownerPhone = 'Valid phone number is required';
    }
    if (
      formData.ownerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)
    ) {
      newErrors.ownerEmail = 'Valid email is required';
    }
    if (formData.startingPrice <= 0)
      newErrors.startingPrice = 'Starting price must be positive';
    if (formData.securityDeposit <= 0)
      newErrors.securityDeposit = 'Security deposit must be positive';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/pgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const pg = await response.json();
        router.push(`/admin/pgs/${pg.id}`);
      } else {
        const error = await response.json();
        if (error.details) {
          const fieldErrors: Record<string, string> = {};
          error.details.forEach((detail: any) => {
            const field = detail.path[0];
            fieldErrors[field] = detail.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(error.error || 'Failed to create PG');
        }
      }
    } catch (error) {
      console.error('Failed to create PG:', error);
      alert('Failed to create PG');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/pgs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PGs
        </Link>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-6 md:px-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Create PG
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Add pricing, location, and contact details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 md:px-8 md:py-8">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  PG Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 outline-none transition focus:ring-4 focus:ring-slate-100 ${
                    errors.name
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200 bg-white focus:border-slate-400'
                  }`}
                  placeholder="Sunrise PG"
                />
                {errors.name ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  placeholder="Short overview of the PG"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 outline-none transition focus:ring-4 focus:ring-slate-100 ${
                        errors.address
                          ? 'border-rose-300 bg-rose-50'
                          : 'border-slate-200 bg-white focus:border-slate-400'
                      }`}
                      placeholder="Full street address"
                    />
                    {errors.address ? (
                      <p className="mt-2 text-xs font-medium text-rose-600">
                        {errors.address}
                      </p>
                    ) : null}
                  </div>

                  {[
                    {
                      id: 'area',
                      label: 'Area',
                      value: formData.area,
                      error: errors.area,
                      placeholder: 'Kokrajhar',
                    },
                    {
                      id: 'city',
                      label: 'City',
                      value: formData.city,
                      error: errors.city,
                      placeholder: 'Kokrajhar',
                    },
                    {
                      id: 'state',
                      label: 'State',
                      value: formData.state,
                      error: errors.state,
                      placeholder: 'Assam',
                    },
                    {
                      id: 'pincode',
                      label: 'Pincode',
                      value: formData.pincode,
                      error: errors.pincode,
                      placeholder: '783370',
                    },
                  ].map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type="text"
                        name={field.id}
                        value={field.value}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 outline-none transition focus:ring-4 focus:ring-slate-100 ${
                          field.error
                            ? 'border-rose-300 bg-rose-50'
                            : 'border-slate-200 bg-white focus:border-slate-400'
                        }`}
                        placeholder={field.placeholder}
                      />
                      {field.error ? (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                          {field.error}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Phone className="h-4 w-4" />
                  Contact
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    {
                      id: 'ownerName',
                      label: 'Contact Name',
                      value: formData.ownerName,
                      error: errors.ownerName,
                      placeholder: 'Owner / Manager',
                    },
                    {
                      id: 'ownerPhone',
                      label: 'Phone',
                      value: formData.ownerPhone,
                      error: errors.ownerPhone,
                      placeholder: '9876543210',
                    },
                    {
                      id: 'ownerEmail',
                      label: 'Email',
                      value: formData.ownerEmail,
                      error: errors.ownerEmail,
                      placeholder: 'name@example.com',
                    },
                    {
                      id: 'alternatePhone',
                      label: 'Alternate Phone',
                      value: formData.alternatePhone,
                      error: '',
                      placeholder: 'Optional',
                    },
                  ].map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type={
                          field.id.includes('Email') ||
                          field.id === 'ownerEmail'
                            ? 'email'
                            : 'text'
                        }
                        name={field.id}
                        value={field.value}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 outline-none transition focus:ring-4 focus:ring-slate-100 ${
                          field.error
                            ? 'border-rose-300 bg-rose-50'
                            : 'border-slate-200 bg-white focus:border-slate-400'
                        }`}
                        placeholder={field.placeholder}
                      />
                      {field.error ? (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                          {field.error}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="startingPrice"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Starting Price
                  </label>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:ring-4 focus-within:ring-slate-100 ${
                      errors.startingPrice
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-slate-200 bg-white focus-within:border-slate-400'
                    }`}
                  >
                    <IndianRupee className="h-4 w-4 text-slate-400" />
                    <input
                      id="startingPrice"
                      type="number"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      className="w-full border-0 bg-transparent p-0 text-base text-slate-900 outline-none"
                      placeholder="8000"
                      min={0}
                    />
                  </div>
                  {errors.startingPrice ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {errors.startingPrice}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="securityDeposit"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Security Deposit
                  </label>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:ring-4 focus-within:ring-slate-100 ${
                      errors.securityDeposit
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-slate-200 bg-white focus-within:border-slate-400'
                    }`}
                  >
                    <IndianRupee className="h-4 w-4 text-slate-400" />
                    <input
                      id="securityDeposit"
                      type="number"
                      name="securityDeposit"
                      value={formData.securityDeposit}
                      onChange={handleInputChange}
                      className="w-full border-0 bg-transparent p-0 text-base text-slate-900 outline-none"
                      placeholder="16000"
                      min={0}
                    />
                  </div>
                  {errors.securityDeposit ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {errors.securityDeposit}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="brokerageCharges"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Brokerage Charges
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
                    <IndianRupee className="h-4 w-4 text-slate-400" />
                    <input
                      id="brokerageCharges"
                      type="number"
                      name="brokerageCharges"
                      value={formData.brokerageCharges}
                      onChange={handleInputChange}
                      className="w-full border-0 bg-transparent p-0 text-base text-slate-900 outline-none"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 text-sm font-medium text-slate-900">
                  Razorpay Settings (optional)
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="razorpayKeyId"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Razorpay Key ID
                    </label>
                    <input
                      id="razorpayKeyId"
                      type="text"
                      name="razorpayKeyId"
                      value={formData.razorpayKeyId}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      placeholder="rzp_live_..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="razorpayKeySecret"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Razorpay Key Secret
                    </label>
                    <input
                      id="razorpayKeySecret"
                      type="text"
                      name="razorpayKeySecret"
                      value={formData.razorpayKeySecret}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      placeholder="Paste secret from Razorpay dashboard"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="razorpayAccountId"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Razorpay Account / Sub-account ID
                    </label>
                    <input
                      id="razorpayAccountId"
                      type="text"
                      name="razorpayAccountId"
                      value={formData.razorpayAccountId}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      placeholder="acct_... (optional, for Route)"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Preview
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formData.name || 'New PG'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">
                      ₹{formattedStartingPrice}
                    </p>
                    <p className="text-sm text-slate-400">
                      Deposit ₹{formattedSecurityDeposit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <Link
                  href="/admin/pgs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create PG
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

