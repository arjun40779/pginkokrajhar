'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  UserCheck,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  occupation?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  moveInDate: string;
  moveOutDate?: string;
  isActive: boolean;
  rentAmount: number;
  rentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
    mobile: string;
    role: string;
    createdAt: string;
  };
  room: {
    id: string;
    roomNumber: string;
    roomType: string;
    floor: number;
    monthlyRent: number;
    securityDeposit: number;
    availabilityStatus: string;
    pg: {
      id: string;
      name: string;
      area: string;
      city: string;
      state: string;
      ownerName: string;
      ownerPhone: string;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentDate?: string;
    dueDate: string;
    month: string;
    notes?: string;
    createdAt: string;
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
  type: 'tenant' | 'rent' | 'payment';
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
    rent: {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
    },
    payment: {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    },
  };

  const icons = {
    rent: {
      PAID: <CheckCircle className="h-3 w-3 mr-1" />,
      PENDING: <Clock className="h-3 w-3 mr-1" />,
      OVERDUE: <AlertTriangle className="h-3 w-3 mr-1" />,
    },
    payment: {
      COMPLETED: <CheckCircle className="h-3 w-3 mr-1" />,
      PENDING: <Clock className="h-3 w-3 mr-1" />,
    },
  };

  const styleKey = type;
  const iconKey = type;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[styleKey][status as keyof (typeof styles)[typeof styleKey]]}`}
    >
      {icons[iconKey][status as keyof (typeof icons)[typeof iconKey]]}
      {status}
    </span>
  );
};

export default function TenantDetailsPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [offlinePaymentDate, setOfflinePaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [offlinePaymentNotes, setOfflinePaymentNotes] = useState('');
  const [isRecordingOfflinePayment, setIsRecordingOfflinePayment] =
    useState(false);
  const [offlinePaymentMessage, setOfflinePaymentMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchTenantDetails();
  }, [params.id]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tenants/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setTenant(data);
      } else {
        console.error('Failed to fetch tenant details');
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordOfflinePayment = async () => {
    try {
      setIsRecordingOfflinePayment(true);
      setOfflinePaymentMessage(null);

      const response = await fetch(
        `/api/admin/tenants/${params.id}/payments/offline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentDate: offlinePaymentDate,
            notes: offlinePaymentNotes,
          }),
        },
      );

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to record offline payment');
      }

      setOfflinePaymentNotes('');
      setOfflinePaymentMessage({
        type: 'success',
        text: 'Offline payment recorded successfully.',
      });
      await fetchTenantDetails();
    } catch (error) {
      setOfflinePaymentMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to record offline payment',
      });
    } finally {
      setIsRecordingOfflinePayment(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="px-6">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tenant not found
          </h3>
          <p className="text-gray-600">
            This tenant may have been deleted or moved.
          </p>
        </div>
      </div>
    );
  }

  const tenancyMonths = Math.ceil(
    (Date.now() - new Date(tenant.moveInDate).getTime()) /
      (1000 * 3600 * 24 * 30),
  );
  const paidPayments = tenant.payments.filter(
    (p) => p.status === 'COMPLETED',
  ).length;
  const pendingPayments = tenant.payments.filter(
    (p) => p.status === 'PENDING',
  ).length;

  return (
    <div className="px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/tenants"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {tenant.name}
              </h1>
              <StatusBadge status={tenant.isActive.toString()} type="tenant" />
              <StatusBadge status={tenant.rentStatus} type="rent" />
            </div>
            <p className="text-gray-600">
              <Link
                href={`/admin/rooms/${tenant.room.id}`}
                className="hover:text-blue-600"
              >
                Room {tenant.room.roomNumber}
              </Link>{' '}
              •{' '}
              <Link
                href={`/admin/pgs/${tenant.room.pg.id}`}
                className="hover:text-blue-600"
              >
                {tenant.room.pg.name}
              </Link>
              {' • '}
              {tenant.room.pg.area}, {tenant.room.pg.city}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/tenants/${tenant.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Tenant
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          {[
            { id: 'overview', name: 'Overview', icon: Eye },
            { id: 'payments', name: 'Payment History', icon: IndianRupee },
            { id: 'account', name: 'User Account', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
                {tab.id === 'payments' && tenant._count.payments > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tenant._count.payments}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Contact Details
                    </h4>
                    <dl className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <dt className="text-sm text-gray-500">Phone</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {tenant.phone}
                          </dd>
                        </div>
                      </div>
                      {tenant.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <dt className="text-sm text-gray-500">Email</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {tenant.email}
                            </dd>
                          </div>
                        </div>
                      )}
                      {tenant.occupation && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <dt className="text-sm text-gray-500">
                              Occupation
                            </dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {tenant.occupation}
                            </dd>
                          </div>
                        </div>
                      )}
                    </dl>
                  </div>

                  {tenant.emergencyContact && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Emergency Contact
                      </h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-500">Name</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {tenant.emergencyContact.name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">
                            Relationship
                          </dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {tenant.emergencyContact.relation}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Phone</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {tenant.emergencyContact.phone}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Room Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Current Room
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500">Room Number</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          <Link
                            href={`/admin/rooms/${tenant.room.id}`}
                            className="hover:text-blue-600"
                          >
                            {tenant.room.roomNumber}
                          </Link>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Room Type</dt>
                        <dd className="text-sm font-medium text-gray-900 capitalize">
                          {tenant.room.roomType.toLowerCase()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Floor</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          Floor {tenant.room.floor}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Status</dt>
                        <dd className="text-sm font-medium text-gray-900 capitalize">
                          {tenant.room.availabilityStatus.toLowerCase()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      PG Information
                    </h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500">PG Name</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          <Link
                            href={`/admin/pgs/${tenant.room.pg.id}`}
                            className="hover:text-blue-600"
                          >
                            {tenant.room.pg.name}
                          </Link>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Location</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {tenant.room.pg.area}, {tenant.room.pg.city},{' '}
                          {tenant.room.pg.state}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Owner</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {tenant.room.pg.ownerName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Owner Phone</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {tenant.room.pg.ownerPhone}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Tenancy Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tenancy Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <IndianRupee className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{tenant.rentAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {new Date(tenant.moveInDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Move-in Date</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {tenancyMonths}
                    </p>
                    <p className="text-sm text-gray-600">Months</p>
                  </div>
                </div>

                {tenant.moveOutDate && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Move-out Date:</span>{' '}
                      {new Date(tenant.moveOutDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Record Offline Rent Payment
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Use this when the tenant has paid cash, bank transfer,
                        or any offline method.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          htmlFor="offline-payment-date"
                        >
                          Payment Date
                        </label>
                        <input
                          id="offline-payment-date"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          type="date"
                          value={offlinePaymentDate}
                          onChange={(event) =>
                            setOfflinePaymentDate(event.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          htmlFor="offline-payment-notes"
                        >
                          Notes
                        </label>
                        <input
                          id="offline-payment-notes"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          type="text"
                          value={offlinePaymentNotes}
                          onChange={(event) =>
                            setOfflinePaymentNotes(event.target.value)
                          }
                          placeholder="Optional reference or payment note"
                        />
                      </div>
                      <button
                        className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        disabled={isRecordingOfflinePayment}
                        onClick={handleRecordOfflinePayment}
                        type="button"
                      >
                        {isRecordingOfflinePayment
                          ? 'Saving...'
                          : 'Mark Current Rent Paid'}
                      </button>
                    </div>
                  </div>

                  {offlinePaymentMessage ? (
                    <div
                      className={`mt-4 rounded-md px-3 py-2 text-sm ${
                        offlinePaymentMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {offlinePaymentMessage.text}
                    </div>
                  ) : null}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment History
                </h3>

                {tenant.payments.length === 0 ? (
                  <div className="text-center py-8">
                    <IndianRupee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Payment History
                    </h4>
                    <p className="text-gray-600">
                      No payments have been recorded for this tenant yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tenant.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-semibold text-gray-900">
                              ₹{payment.amount.toLocaleString()}
                            </div>
                            <StatusBadge
                              status={payment.status}
                              type="payment"
                            />
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.month}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Due Date:</span>
                            <br />
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                          {payment.paymentDate && (
                            <div>
                              <span className="font-medium">Paid Date:</span>
                              <br />
                              {new Date(
                                payment.paymentDate,
                              ).toLocaleDateString()}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Created:</span>
                            <br />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span>{' '}
                              {payment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  User Account Information
                </h3>

                {tenant.user ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Account Details
                        </h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm text-gray-500">User ID</dt>
                            <dd className="text-sm font-mono text-gray-900">
                              {tenant.user.id}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Name</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {tenant.user.name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Mobile</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {tenant.user.mobile}
                            </dd>
                          </div>
                          {tenant.user.email && (
                            <div>
                              <dt className="text-sm text-gray-500">Email</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {tenant.user.email}
                              </dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-sm text-gray-500">Role</dt>
                            <dd className="text-sm font-medium text-gray-900 capitalize">
                              {tenant.user.role.toLowerCase()}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Account Status
                        </h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm text-gray-500">
                              Account Created
                            </dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {new Date(
                                tenant.user.createdAt,
                              ).toLocaleDateString()}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">
                              Portal Access
                            </dt>
                            <dd className="text-sm font-medium text-green-600">
                              ✓ Enabled
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No User Account
                    </h4>
                    <p className="text-gray-600">
                      This tenant doesn't have a linked user account for portal
                      access.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Payments</span>
                <span className="font-medium text-gray-900">
                  {tenant._count.payments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Paid Payments</span>
                <span className="font-medium text-green-600">
                  {paidPayments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Payments</span>
                <span className="font-medium text-yellow-600">
                  {pendingPayments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tenancy Duration</span>
                <span className="font-medium text-gray-900">
                  {tenancyMonths} months
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Meta */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tenant Information
            </h3>

            <div className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Tenant ID</dt>
                <dd className="text-sm font-mono text-gray-900">{tenant.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(tenant.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Rent Status</dt>
                <dd className="text-sm">
                  <StatusBadge status={tenant.rentStatus} type="rent" />
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

