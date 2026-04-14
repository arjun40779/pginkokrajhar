'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getMinimumOccupancyForRoomType } from '@/lib/rooms/occupancy';

interface PG {
  id: string;
  name: string;
  area: string;
  city: string;
}

interface RoomFormData {
  roomNumber: string;
  description: string;
  pgId: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  hasFan: boolean;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  availableFrom?: string;
}

const initialFormData: RoomFormData = {
  roomNumber: '',
  description: '',
  pgId: '',
  roomType: 'SINGLE',
  maxOccupancy: 1,
  hasBalcony: false,
  hasAttachedBath: false,
  hasAC: false,
  hasFan: true,
  monthlyRent: 0,
  securityDeposit: 0,
  maintenanceCharges: 0,
  availableFrom: undefined,
};

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    try {
      const response = await fetch('/api/admin/pgs?limit=100');
      const data = await response.json();
      setPgs(data.pgs);
    } catch (error) {
      console.error('Failed to fetch PGs:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? Number(newValue) : newValue,
      };

      if (name === 'roomType') {
        updated.maxOccupancy = getMinimumOccupancyForRoomType(
          newValue as RoomFormData['roomType'],
        );
      }

      return updated;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.pgId) newErrors.pgId = 'PG selection is required';
    if (!formData.roomType) newErrors.roomType = 'Room type is required';
    if (!formData.maxOccupancy || formData.maxOccupancy <= 0)
      newErrors.maxOccupancy = 'Max occupancy must be greater than 0';
    if (!formData.monthlyRent || formData.monthlyRent <= 0)
      newErrors.monthlyRent = 'Monthly rent must be greater than 0';
    if (formData.securityDeposit < 0)
      newErrors.securityDeposit = 'Security deposit cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.refresh();
        router.push('/admin/rooms');
      } else {
        const error = await response.json();
        if (error.details) {
          const fieldErrors: Record<string, string> = {};
          error.details.forEach((err: any) => {
            fieldErrors[err.path[0]] = err.message;
          });
          if (!fieldErrors.general) {
            fieldErrors.general = 'Please fix the highlighted fields.';
          }
          setErrors(fieldErrors);
        } else {
          setErrors({ general: error.error || 'Failed to create room' });
        }
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/rooms"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">
                  Create New Room
                </h1>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="roomNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="roomNumber"
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="101"
                />
                {errors.roomNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.roomNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pgId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  PG <span className="text-red-500">*</span>
                </label>
                <select
                  id="pgId"
                  name="pgId"
                  value={formData.pgId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.pgId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select PG</option>
                  {pgs.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      {pg.name} - {pg.area}, {pg.city}
                    </option>
                  ))}
                </select>
                {errors.pgId && (
                  <p className="text-red-500 text-xs mt-1">{errors.pgId}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="roomType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="TRIPLE">Triple</option>
                  <option value="DORMITORY">Dormitory</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="monthlyRent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Monthly Rent (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="monthlyRent"
                  type="number"
                  name="monthlyRent"
                  value={formData.monthlyRent || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="5000"
                  min="0"
                />
                {errors.monthlyRent && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.monthlyRent}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="securityDeposit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Security Deposit (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="securityDeposit"
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.securityDeposit
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="10000"
                  min="0"
                />
                {errors.securityDeposit && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.securityDeposit}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/rooms"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Create room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new room with the details you entered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmedSubmit();
              }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

