'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Room {
  id: string;
  roomNumber: string;
  slug: string;
  description?: string;
  pgId: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  floor: number;
  roomSize?: number;
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  hasFan: boolean;
  windowDirection?:
    | 'NORTH'
    | 'SOUTH'
    | 'EAST'
    | 'WEST'
    | 'NORTHEAST'
    | 'NORTHWEST'
    | 'SOUTHEAST'
    | 'SOUTHWEST';
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  electricityIncluded: boolean;
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  availableFrom?: string;
  featured: boolean;
  isActive: boolean;
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
  };
}

interface RoomFormData {
  roomNumber: string;
  slug: string;
  description: string;

  // Room Details
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  floor: number;
  roomSize?: number;

  // Features
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  hasFan: boolean;
  windowDirection?:
    | 'NORTH'
    | 'SOUTH'
    | 'EAST'
    | 'WEST'
    | 'NORTHEAST'
    | 'NORTHWEST'
    | 'SOUTHEAST'
    | 'SOUTHWEST';

  // Pricing
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  electricityIncluded: boolean;

  // Availability
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  availableFrom?: string;

  // Meta
  featured: boolean;
  isActive: boolean;
}

const initialFormData: RoomFormData = {
  roomNumber: '',
  slug: '',
  description: '',
  roomType: 'SINGLE',
  maxOccupancy: 1,
  floor: 1,
  roomSize: undefined,
  hasBalcony: false,
  hasAttachedBath: false,
  hasAC: false,
  hasFan: true,
  windowDirection: undefined,
  monthlyRent: 0,
  securityDeposit: 0,
  maintenanceCharges: 0,
  electricityIncluded: true,
  availabilityStatus: 'AVAILABLE',
  availableFrom: undefined,
  featured: false,
  isActive: true,
};

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/rooms/${params.id}`);
      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
        setFormData({
          roomNumber: roomData.roomNumber || '',
          slug: roomData.slug || '',
          description: roomData.description || '',
          roomType: roomData.roomType || 'SINGLE',
          maxOccupancy: roomData.maxOccupancy || 1,
          floor: roomData.floor || 1,
          roomSize: roomData.roomSize,
          hasBalcony: roomData.hasBalcony || false,
          hasAttachedBath: roomData.hasAttachedBath || false,
          hasAC: roomData.hasAC || false,
          hasFan: roomData.hasFan ?? true,
          windowDirection: roomData.windowDirection,
          monthlyRent: Number(roomData.monthlyRent) || 0,
          securityDeposit: Number(roomData.securityDeposit) || 0,
          maintenanceCharges: Number(roomData.maintenanceCharges) || 0,
          electricityIncluded: roomData.electricityIncluded ?? true,
          availabilityStatus: roomData.availabilityStatus || 'AVAILABLE',
          availableFrom: roomData.availableFrom
            ? new Date(roomData.availableFrom).toISOString().split('T')[0]
            : undefined,
          featured: roomData.featured || false,
          isActive: roomData.isActive ?? true,
        });
      } else {
        router.push('/admin/rooms');
      }
    } catch (error) {
      console.error('Failed to fetch room:', error);
      router.push('/admin/rooms');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (roomNumber: string, pgName: string) => {
    const pgSlug = pgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${pgSlug}-${roomNumber}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value) || 0
          : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Auto-generate slug when room number changes
      if (name === 'roomNumber' && room) {
        updated.slug = generateSlug(updated.roomNumber, room.pg.name);
      }

      // Auto-set occupancy based on room type
      if (name === 'roomType') {
        const occupancyMap = {
          SINGLE: 1,
          DOUBLE: 2,
          TRIPLE: 3,
          DORMITORY: 4,
        };
        updated.maxOccupancy =
          occupancyMap[newValue as keyof typeof occupancyMap];
      }

      return updated;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomNumber) newErrors.roomNumber = 'Room number is required';
    if (!formData.slug) newErrors.slug = 'Slug is required';
    if (formData.maxOccupancy <= 0)
      newErrors.maxOccupancy = 'Max occupancy must be positive';
    if (formData.monthlyRent <= 0)
      newErrors.monthlyRent = 'Monthly rent must be positive';
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

    setSaving(true);

    try {
      // Convert availableFrom to datetime if provided
      const submitData = {
        ...formData,
        availableFrom: formData.availableFrom
          ? new Date(formData.availableFrom).toISOString()
          : undefined,
      };

      const response = await fetch(`/api/admin/rooms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push(`/admin/rooms/${params.id}`);
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
          alert(error.error || 'Failed to update room');
        }
      }
    } catch (error) {
      console.error('Failed to update room:', error);
      alert('Failed to update room');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="px-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href={`/admin/rooms/${params.id}`}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Room</h1>
            <p className="text-gray-600">
              Update room details for {room.pg.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PG Information (Read-only) */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            PG Information
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-900">
                {room.pg.name}
              </p>
              <p className="text-sm text-gray-500">
                {room.pg.area}, {room.pg.city}
              </p>
            </div>
            <Link
              href={`/admin/pgs/${room.pg.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View PG Details →
            </Link>
          </div>
        </div>

        {/* Basic Room Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="101, A1, etc."
              />
              {errors.roomNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="room-url-slug"
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the room"
              />
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Room Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TRIPLE">Triple</option>
                <option value="DORMITORY">Dormitory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Occupancy <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxOccupancy"
                value={formData.maxOccupancy}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.maxOccupancy ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
                max="10"
              />
              {errors.maxOccupancy && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.maxOccupancy}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Size (sq ft)
              </label>
              <input
                type="number"
                name="roomSize"
                value={formData.roomSize || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
                min="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Window Direction
              </label>
              <select
                name="windowDirection"
                value={formData.windowDirection || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select direction</option>
                <option value="NORTH">North</option>
                <option value="SOUTH">South</option>
                <option value="EAST">East</option>
                <option value="WEST">West</option>
                <option value="NORTHEAST">Northeast</option>
                <option value="NORTHWEST">Northwest</option>
                <option value="SOUTHEAST">Southeast</option>
                <option value="SOUTHWEST">Southwest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Status
              </label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From
              </label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasBalcony"
                name="hasBalcony"
                checked={formData.hasBalcony}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="hasBalcony"
                className="text-sm font-medium text-gray-700"
              >
                Balcony
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasAttachedBath"
                name="hasAttachedBath"
                checked={formData.hasAttachedBath}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="hasAttachedBath"
                className="text-sm font-medium text-gray-700"
              >
                Attached Bathroom
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasAC"
                name="hasAC"
                checked={formData.hasAC}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="hasAC"
                className="text-sm font-medium text-gray-700"
              >
                Air Conditioning
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasFan"
                name="hasFan"
                checked={formData.hasFan}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="hasFan"
                className="text-sm font-medium text-gray-700"
              >
                Ceiling Fan
              </label>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.securityDeposit ? 'border-red-500' : 'border-gray-300'
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Charges (₹)
              </label>
              <input
                type="number"
                name="maintenanceCharges"
                value={formData.maintenanceCharges}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="electricityIncluded"
                name="electricityIncluded"
                checked={formData.electricityIncluded}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="electricityIncluded"
                className="text-sm font-medium text-gray-700"
              >
                Electricity Included
              </label>
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Meta Information
          </h2>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-gray-700"
              >
                Featured Room
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active Room
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            href={`/admin/rooms/${params.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
