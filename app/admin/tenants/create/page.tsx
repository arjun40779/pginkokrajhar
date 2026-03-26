'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  maxOccupancy: number;
  currentOccupancy: number;
  monthlyRent: number;
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
  };
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  moveInDate: string;
  rentAmount: number;
  rentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  roomId: string;
  isActive: boolean;
  createUser: boolean;
}

export default function CreateTenantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedRoomId = searchParams.get('roomId');
  const preSelectedPgId = searchParams.get('pgId');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    occupation: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    moveInDate: new Date().toISOString().split('T')[0],
    rentAmount: 0,
    rentStatus: 'PENDING',
    roomId: preSelectedRoomId || '',
    isActive: true,
    createUser: true,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(preSelectedPgId && { pgId: preSelectedPgId }),
        status: 'available', // Only show available rooms
      });

      const response = await fetch(`/api/admin/rooms?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Auto-fill rent amount when room is selected
    if (name === 'roomId' && value) {
      const selectedRoom = rooms.find((room) => room.id === value);
      if (selectedRoom) {
        setFormData((prev) => ({
          ...prev,
          rentAmount: selectedRoom.monthlyRent,
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Room selection is required';
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Move-in date is required';
    }

    if (formData.rentAmount <= 0) {
      newErrors.rentAmount = 'Rent amount must be greater than 0';
    }

    if (formData.emergencyContactName && !formData.emergencyContactPhone) {
      newErrors.emergencyContactPhone =
        'Emergency contact phone is required if name is provided';
    }

    if (formData.emergencyContactPhone && !formData.emergencyContactName) {
      newErrors.emergencyContactName =
        'Emergency contact name is required if phone is provided';
    }

    if (formData.emergencyContactName && !formData.emergencyContactRelation) {
      newErrors.emergencyContactRelation =
        'Emergency contact relation is required if contact is provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
        emergencyContact:
          formData.emergencyContactName && formData.emergencyContactPhone
            ? {
                name: formData.emergencyContactName.trim(),
                relation: formData.emergencyContactRelation.trim(),
                phone: formData.emergencyContactPhone.trim(),
              }
            : undefined,
        moveInDate: new Date(formData.moveInDate).toISOString(),
        rentAmount: formData.rentAmount,
        rentStatus: formData.rentStatus,
        roomId: formData.roomId,
        isActive: formData.isActive,
        createUser: formData.createUser,
      };

      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const tenant = await response.json();
        router.push(`/admin/tenants/${tenant.id}`);
      } else {
        const error = await response.json();
        if (error.details) {
          const validationErrors: Record<string, string> = {};
          error.details.forEach((detail: any) => {
            validationErrors[detail.path[0]] = detail.message;
          });
          setErrors(validationErrors);
        } else {
          setErrors({ general: error.error || 'Failed to create tenant' });
        }
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      setErrors({ general: 'Failed to create tenant. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find((room) => room.id === formData.roomId);

  return (
    <div className="px-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/admin/tenants"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
          <p className="text-gray-600">Add a new tenant to your PG system</p>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter tenant's full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address (optional)"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer, Student"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Emergency Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emergencyContactName
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter contact name"
                />
                {errors.emergencyContactName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergencyContactName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emergencyContactRelation
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Father, Mother, Brother"
                />
                {errors.emergencyContactRelation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergencyContactRelation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emergencyContactPhone
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter contact phone"
                />
                {errors.emergencyContactPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergencyContactPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Room & Tenancy Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Room & Tenancy Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Room *
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.roomId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.pg.name} ({room.pg.area}) -
                      {room.roomType} - Available:{' '}
                      {room.maxOccupancy - room.currentOccupancy}
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>
                )}
                {loading && (
                  <p className="mt-1 text-sm text-gray-500">Loading rooms...</p>
                )}
              </div>

              {selectedRoom && (
                <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Selected Room Details
                  </h4>
                  <div className="text-sm text-blue-800">
                    <p>
                      <strong>Room:</strong> {selectedRoom.roomNumber} (
                      {selectedRoom.roomType})
                    </p>
                    <p>
                      <strong>PG:</strong> {selectedRoom.pg.name} -{' '}
                      {selectedRoom.pg.area}, {selectedRoom.pg.city}
                    </p>
                    <p>
                      <strong>Occupancy:</strong>{' '}
                      {selectedRoom.currentOccupancy}/
                      {selectedRoom.maxOccupancy}
                    </p>
                    <p>
                      <strong>Monthly Rent:</strong> ₹
                      {selectedRoom.monthlyRent.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move-in Date *
                </label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.moveInDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.moveInDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.moveInDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent Amount *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.rentAmount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter rent amount"
                    min="0"
                    step="100"
                  />
                </div>
                {errors.rentAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rentAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Status
                </label>
                <select
                  name="rentStatus"
                  value={formData.rentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active Tenant
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="createUser"
                    checked={formData.createUser}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Create User Account
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Creates a user account for tenant portal access
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/admin/tenants"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Tenant...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tenant
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
