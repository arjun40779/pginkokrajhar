'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAdminPGs } from '@/lib/hooks/useApi';

interface PG {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  totalRooms: number;
  occupiedRooms: number;
  monthlyRent: number;
}

interface AdminPGResponse {
  pgs?: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    ownerPhone: string;
    ownerEmail: string | null;
    totalRooms: number;
    availableRooms: number;
    startingPrice: number | string;
  }>;
}

function mapPGs(data?: AdminPGResponse): PG[] {
  return (data?.pgs || []).map((pg) => ({
    id: pg.id,
    name: pg.name,
    address: pg.address,
    city: pg.city,
    phone: pg.ownerPhone,
    email: pg.ownerEmail,
    totalRooms: pg.totalRooms,
    occupiedRooms: Math.max(0, pg.totalRooms - pg.availableRooms),
    monthlyRent: Number(pg.startingPrice),
  }));
}

export function PGManagement() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data, error, isLoading, mutate } = useAdminPGs(1, 100) as {
    data?: AdminPGResponse;
    error?: Error;
    isLoading: boolean;
    mutate: () => Promise<AdminPGResponse | undefined>;
  };

  const pgs = useMemo(() => mapPGs(data), [data]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PG?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/pgs/${id}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete PG');
      }

      await mutate();
    } catch (deleteError) {
      console.error('Failed to delete PG:', deleteError);
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete PG',
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            PG Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage all your paying guest properties
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pgs/create">
            <Plus className="w-4 h-4 mr-2" />
            Add PG
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading PGs...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="hidden border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 lg:grid lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.6fr)_120px_120px_140px_100px] lg:gap-4">
          <span>Property</span>
          <span>Contact</span>
          <span>Total Rooms</span>
          <span>Occupied</span>
          <span>Monthly Rent</span>
          <span>Actions</span>
        </div>

        {!isLoading && !error && pgs.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No PGs found.
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {pgs.map((pg) => (
            <div
              key={pg.id}
              className="px-6 py-5 transition-colors hover:bg-gray-50 lg:grid lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.6fr)_120px_120px_140px_100px] lg:items-center lg:gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h3 className="truncate text-base font-semibold text-gray-900 lg:text-lg">
                      {pg.name}
                    </h3>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p>{pg.address}</p>
                        <p>{pg.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 lg:mt-0">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{pg.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {pg.email || 'No email available'}
                  </span>
                </div>
              </div>

              <div className="mt-4 lg:mt-0">
                <p className="text-xs uppercase tracking-wide text-gray-500 lg:hidden">
                  Total Rooms
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {pg.totalRooms}
                </p>
              </div>

              <div className="mt-4 lg:mt-0">
                <p className="text-xs uppercase tracking-wide text-gray-500 lg:hidden">
                  Occupied
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {pg.occupiedRooms}
                </p>
              </div>

              <div className="mt-4 lg:mt-0">
                <p className="text-xs uppercase tracking-wide text-gray-500 lg:hidden">
                  Monthly Rent
                </p>
                <p className="text-lg font-semibold text-green-600">
                  ₹{pg.monthlyRent.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 lg:mt-0 lg:justify-end">
                <Link
                  href={`/admin/pgs/${pg.id}/edit`}
                  className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(pg.id)}
                  disabled={deletingId === pg.id}
                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

