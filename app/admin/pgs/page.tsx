'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  MapPin,
  Phone,
  Users,
  Eye,
  Edit,
  Trash2,
  Star,
} from 'lucide-react';

interface PG {
  id: string;
  name: string;
  slug: string;
  area: string;
  city: string;
  state: string;
  ownerName: string;
  ownerPhone: string;
  totalRooms: number;
  availableRooms: number;
  startingPrice: number;
  featured: boolean;
  isActive: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  _count: {
    rooms: number;
    bookings: number;
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}
    >
      {status}
    </span>
  );
};

const PGCard = ({
  pg,
  onDelete,
}: {
  pg: PG;
  onDelete: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{pg.name}</h3>
            {pg.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {!pg.isActive && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {pg.area}, {pg.city}, {pg.state}
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Phone className="h-4 w-4 mr-1" />
            {pg.ownerName} • {pg.ownerPhone}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {pg.availableRooms}/{pg.totalRooms} rooms available • Starting ₹
            {pg.startingPrice.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={pg.verificationStatus} />
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <Link
                    href={`/admin/pgs/${pg.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    href={`/admin/pgs/${pg.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit PG
                  </Link>
                  <Link
                    href={`/admin/pgs/${pg.id}/rooms`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Rooms
                  </Link>
                  <button
                    onClick={() => onDelete(pg.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete PG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {pg._count.rooms}
          </p>
          <p className="text-xs text-gray-500">Total Rooms</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {pg._count.bookings}
          </p>
          <p className="text-xs text-gray-500">Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">
            {Math.round(
              ((pg.totalRooms - pg.availableRooms) / pg.totalRooms) * 100,
            )}
            %
          </p>
          <p className="text-xs text-gray-500">Occupied</p>
        </div>
      </div>
    </div>
  );
};

export default function PGsListPage() {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  useEffect(() => {
    fetchPGs();
  }, [searchTerm, statusFilter, featuredFilter]);

  const fetchPGs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter !== 'all') params.append('featured', featuredFilter);

      const response = await fetch(`/api/admin/pgs?${params}`);
      const data = await response.json();
      setPgs(data.pgs);
    } catch (error) {
      console.error('Failed to fetch PGs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this PG? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pgs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPgs(pgs.filter((pg) => pg.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete PG');
      }
    } catch (error) {
      console.error('Failed to delete PG:', error);
      alert('Failed to delete PG');
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PG Management</h1>
          <p className="text-gray-600">
            Manage your paying guest accommodations
          </p>
        </div>
        <Link
          href="/admin/pgs/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New PG
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PGs by name, area, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All PGs</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* PG List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : pgs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No PGs found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || featuredFilter !== 'all'
              ? 'No PGs match your current filters.'
              : "You haven't added any PG accommodations yet."}
          </p>
          <Link
            href="/admin/pgs/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First PG
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pgs.map((pg) => (
            <PGCard key={pg.id} pg={pg} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
