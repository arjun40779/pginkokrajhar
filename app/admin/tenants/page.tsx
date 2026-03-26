'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  IndianRupee,
  User,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  occupation?: string;
  moveInDate: string;
  moveOutDate?: string;
  isActive: boolean;
  rentAmount: number;
  rentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
    mobile: string;
  };
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    pg: {
      id: string;
      name: string;
      area: string;
      city: string;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentDate?: string;
    month: string;
  }>;
  _count: {
    payments: number;
  };
}

const StatusBadge = ({
  status,
  type,
}: {
  status: string;
  type: 'tenant' | 'rent';
}) => {
  if (type === 'tenant') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === 'true'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {status === 'true' ? 'Active' : 'Inactive'}
      </span>
    );
  }

  const styles = {
    PAID: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    OVERDUE: 'bg-red-100 text-red-800',
  };

  const icons = {
    PAID: <CheckCircle className="h-3 w-3 mr-1" />,
    PENDING: <Clock className="h-3 w-3 mr-1" />,
    OVERDUE: <AlertTriangle className="h-3 w-3 mr-1" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}
    >
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
};

const TenantCard = ({
  tenant,
  onDelete,
}: {
  tenant: Tenant;
  onDelete: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tenant.name}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-3 w-3 mr-1" />
                  {tenant.phone}
                </div>
                {tenant.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-1" />
                    {tenant.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building2 className="h-4 w-4 mr-2" />
            <Link
              href={`/admin/rooms/${tenant.room.id}`}
              className="hover:text-blue-600"
            >
              Room {tenant.room.roomNumber}
            </Link>
            <span className="mx-2">•</span>
            <Link
              href={`/admin/pgs/${tenant.room.pg.id}`}
              className="hover:text-blue-600"
            >
              {tenant.room.pg.name}
            </Link>
          </div>

          {/* Rent Information */}
          <div className="flex items-center text-lg font-semibold text-gray-900 mb-2">
            <IndianRupee className="h-5 w-5 mr-1" />
            {tenant.rentAmount.toLocaleString()}/month
          </div>

          {/* Move-in Date & Occupation */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Moved in: {new Date(tenant.moveInDate).toLocaleDateString()}
            </div>
            {tenant.occupation && (
              <>
                <span>•</span>
                <span>{tenant.occupation}</span>
              </>
            )}
          </div>

          {/* Recent Payments Summary */}
          {tenant.payments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Recent Payment: {tenant.payments[0].month}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  ₹{tenant.payments[0].amount.toLocaleString()}
                </span>
                <StatusBadge status={tenant.payments[0].status} type="rent" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={tenant.isActive.toString()} type="tenant" />
          <StatusBadge status={tenant.rentStatus} type="rent" />

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
                    href={`/admin/tenants/${tenant.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    href={`/admin/tenants/${tenant.id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tenant
                  </Link>
                  <button
                    onClick={() => onDelete(tenant.id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Tenant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">
            {tenant._count.payments}
          </p>
          <p className="text-xs text-gray-500">Payments</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 capitalize">
            {tenant.room.roomType.toLowerCase()}
          </p>
          <p className="text-xs text-gray-500">Room Type</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">
            {Math.ceil(
              (new Date().getTime() - new Date(tenant.moveInDate).getTime()) /
                (1000 * 3600 * 24 * 30),
            )}
          </p>
          <p className="text-xs text-gray-500">Months</p>
        </div>
      </div>
    </div>
  );
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rentStatusFilter, setRentStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchTenants();
  }, [searchTerm, statusFilter, rentStatusFilter, pagination.page]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(rentStatusFilter !== 'all' && { rentStatus: rentStatusFilter }),
      });

      const response = await fetch(`/api/admin/tenants?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (
      !confirm(
        'Are you sure you want to remove this tenant? If they have payment history, they will be deactivated instead of deleted.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTenants(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove tenant');
      }
    } catch (error) {
      console.error('Failed to remove tenant:', error);
      alert('Failed to remove tenant');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const filteredCount = tenants.length;

  if (loading && pagination.page === 1) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">Manage all tenants across your PGs</p>
        </div>
        <Link
          href="/admin/tenants/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
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
              value={rentStatusFilter}
              onChange={(e) => setRentStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Rent Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        )}
      </div>

      {/* Tenants List */}
      {tenants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {pagination.totalCount === 0
              ? 'No tenants found'
              : 'No tenants match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {pagination.totalCount === 0
              ? "You haven't added any tenants yet."
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {pagination.totalCount === 0 && (
            <Link
              href="/admin/tenants/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Tenant
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount,
              )}{' '}
              of {pagination.totalCount} tenants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onDelete={handleDeleteTenant}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 2,
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pagination.page
                          ? 'text-white bg-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
