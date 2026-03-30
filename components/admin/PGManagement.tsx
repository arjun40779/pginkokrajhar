import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';

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

export function PGManagement() {
  const [pgs, setPGs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPGs();
  }, []);

  const fetchPGs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/pgs');
      const data = (await response.json().catch(() => null)) as {
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
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch PGs');
      }

      setPGs(
        (data?.pgs || []).map((pg) => ({
          id: pg.id,
          name: pg.name,
          address: pg.address,
          city: pg.city,
          phone: pg.ownerPhone,
          email: pg.ownerEmail,
          totalRooms: pg.totalRooms,
          occupiedRooms: Math.max(0, pg.totalRooms - pg.availableRooms),
          monthlyRent: Number(pg.startingPrice),
        })),
      );
    } catch (fetchError) {
      console.error('Failed to fetch PGs:', fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to fetch PGs',
      );
      setPGs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PG?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pgs/${id}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete PG');
      }

      setPGs((current) => current.filter((pg) => pg.id !== id));
    } catch (deleteError) {
      console.error('Failed to delete PG:', deleteError);
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete PG',
      );
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

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading PGs...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pgs.map((pg) => (
          <div
            key={pg.id}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{pg.name}</h3>
              <div className="flex gap-2">
                <Link
                  href={`/admin/pgs/${pg.id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(pg.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">{pg.address}</p>
                  <p className="text-sm">{pg.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{pg.phone}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{pg.email || 'No email available'}</p>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Rooms</p>
                    <p className="text-lg font-semibold">{pg.totalRooms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Occupied</p>
                    <p className="text-lg font-semibold">{pg.occupiedRooms}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Monthly Rent</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{pg.monthlyRent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

