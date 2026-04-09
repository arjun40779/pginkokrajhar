import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
} from 'lucide-react';

import { prisma } from '@/prisma';
import { deleteTenantAction } from '@/app/admin/tenants/actions';

import { Button } from '../ui/button';

function getTenantStatus(moveOutDate: Date | null, isActive: boolean) {
  if (!isActive) {
    return 'Inactive';
  }

  if (moveOutDate) {
    return 'Notice Period';
  }

  return 'Active';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
      return 'bg-gray-100 text-gray-800';
    case 'Notice Period':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function TenantManagement() {
  const tenants = await prisma.tenant.findMany({
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    include: {
      room: {
        select: {
          id: true,
          roomNumber: true,
          pg: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Tenant Management
          </h2>
          <p className="text-gray-500 mt-1">
            Manage all tenants across your properties
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tenants/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PG & Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No tenants found.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => {
                  const tenantStatus = getTenantStatus(
                    tenant.moveOutDate,
                    tenant.isActive,
                  );

                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <Link
                              href={`/admin/tenants/${tenant.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {tenant.name}
                            </Link>
                            {tenant.occupation && (
                              <div className="text-sm text-gray-500">
                                {tenant.occupation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {tenant.phone}
                          </div>
                          {tenant.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {tenant.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/pgs/${tenant.room.pg.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600"
                        >
                          {tenant.room.pg.name}
                        </Link>
                        <div className="text-sm text-gray-500">
                          <Link
                            href={`/admin/rooms/${tenant.room.id}`}
                            className="hover:text-blue-600"
                          >
                            Room {tenant.room.roomNumber}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(tenant.moveInDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center font-medium text-green-600">
                            <CreditCard className="w-4 h-4 mr-1" />₹
                            {tenant.rentAmount.toLocaleString()}
                          </div>
                          <span
                            className={`mt-1 text-xs font-medium ${tenant.rentStatus === 'PAID' ? 'text-green-600' : tenant.rentStatus === 'OVERDUE' ? 'text-red-600' : 'text-yellow-600'}`}
                          >
                            {tenant.rentStatus === 'PAID'
                              ? 'Rent Paid'
                              : tenant.rentStatus === 'OVERDUE'
                                ? 'Rent Overdue'
                                : 'Rent Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenantStatus)}`}
                        >
                          {tenantStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/tenants/${tenant.id}/edit`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <form
                            action={deleteTenantAction.bind(null, tenant.id)}
                          >
                            <button
                              type="submit"
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

