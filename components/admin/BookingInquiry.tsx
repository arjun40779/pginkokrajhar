'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

import { Button } from '../ui/button';

interface Inquiry {
  id: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  createdAt: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
  };
}

const statusLabels: Record<Inquiry['status'], string> = {
  NEW: 'Pending',
  CONTACTED: 'Contacted',
  CONVERTED: 'Converted',
  CLOSED: 'Rejected',
};

function getStatusColor(status: Inquiry['status']) {
  switch (status) {
    case 'NEW':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONTACTED':
      return 'bg-blue-100 text-blue-800';
    case 'CONVERTED':
      return 'bg-green-100 text-green-800';
    case 'CLOSED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: Inquiry['status']) {
  switch (status) {
    case 'NEW':
      return <Clock className="w-4 h-4" />;
    case 'CONTACTED':
      return <MessageSquare className="w-4 h-4" />;
    case 'CONVERTED':
      return <CheckCircle className="w-4 h-4" />;
    case 'CLOSED':
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
}

export default function BookingInquiry() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });
      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      const nextInquiries: Inquiry[] = data.inquiries || [];
      setInquiries(nextInquiries);
      setSelectedInquiry((current) => {
        if (!nextInquiries.length) {
          return null;
        }
        if (!current) {
          return nextInquiries[0];
        }
        return (
          nextInquiries.find((inquiry) => inquiry.id === current.id) ||
          nextInquiries[0]
        );
      });
    } catch (fetchError) {
      console.error('Failed to fetch inquiries:', fetchError);
      setError('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry');
      }

      const updatedInquiry: Inquiry = await response.json();
      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry.id === id ? updatedInquiry : inquiry,
        ),
      );
      setSelectedInquiry((current) =>
        current?.id === id ? updatedInquiry : current,
      );
    } catch (updateError) {
      console.error('Failed to update inquiry:', updateError);
      setError('Failed to update inquiry status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Booking Inquiries
          </h2>
          <p className="text-gray-500 mt-1">
            Manage incoming booking requests and inquiries
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse"
              >
                <div className="h-5 w-40 rounded bg-gray-200 mb-3"></div>
                <div className="h-4 w-56 rounded bg-gray-200 mb-2"></div>
                <div className="h-4 w-full rounded bg-gray-200 mb-3"></div>
                <div className="h-4 w-64 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-5 w-32 rounded bg-gray-200 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-4 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Booking Inquiries
        </h2>
        <p className="text-gray-500 mt-1">
          Manage incoming booking requests and inquiries
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No inquiries found</p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`bg-white rounded-lg p-6 shadow-sm border-2 transition-all cursor-pointer ${
                  selectedInquiry?.id === inquiry.id
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {inquiry.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {inquiry.pg.name} - {inquiry.pg.area}, {inquiry.pg.city}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(inquiry.status)}`}
                    >
                      {getStatusIcon(inquiry.status)}
                      {statusLabels[inquiry.status]}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {inquiry.message || 'No message provided.'}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {inquiry.phone}
                  </div>
                  {inquiry.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {inquiry.email}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedInquiry ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Inquiry Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Name
                  </p>
                  <p className="text-gray-900 mt-1">{selectedInquiry.name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </p>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="hover:text-blue-600"
                      >
                        {selectedInquiry.phone}
                      </a>
                    </div>
                    {selectedInquiry.email && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          className="hover:text-blue-600"
                        >
                          {selectedInquiry.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Property
                  </p>
                  <p className="text-gray-900 mt-1">
                    {selectedInquiry.pg.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedInquiry.pg.area}, {selectedInquiry.pg.city}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Date
                  </p>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedInquiry.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Message
                  </p>
                  <p className="text-gray-900 mt-1">
                    {selectedInquiry.message || 'No message provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase block mb-3">
                    Update Status
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        updateStatus(selectedInquiry.id, 'CONTACTED')
                      }
                      variant="outline"
                      className="w-full justify-start"
                      disabled={
                        selectedInquiry.status === 'CONTACTED' ||
                        updatingId === selectedInquiry.id
                      }
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mark as Contacted
                    </Button>
                    <Button
                      onClick={() =>
                        updateStatus(selectedInquiry.id, 'CONVERTED')
                      }
                      variant="outline"
                      className="w-full justify-start text-green-600 hover:text-green-700"
                      disabled={
                        selectedInquiry.status === 'CONVERTED' ||
                        updatingId === selectedInquiry.id
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Converted
                    </Button>
                    <Button
                      onClick={() => updateStatus(selectedInquiry.id, 'CLOSED')}
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      disabled={
                        selectedInquiry.status === 'CLOSED' ||
                        updatingId === selectedInquiry.id
                      }
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark as Rejected
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

