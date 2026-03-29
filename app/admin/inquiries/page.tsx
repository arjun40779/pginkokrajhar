'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  source?: string;
  createdAt: string;
  pg: {
    id: string;
    name: string;
    area: string;
    city: string;
  };
}

const statusConfig = {
  NEW: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'New' },
  CONTACTED: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Phone,
    label: 'Contacted',
  },
  CONVERTED: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Converted',
  },
  CLOSED: {
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
    label: 'Closed',
  },
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch inquiries');

      const data = await response.json();
      setInquiries(data.inquiries || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update inquiry');

      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 mt-1">
            Manage customer inquiries and leads
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <div className="flex gap-2">
            {['all', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                >
                  {status === 'all'
                    ? 'All'
                    : statusConfig[status as keyof typeof statusConfig]
                        ?.label || status}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {loading && (
        <div className="space-y-4">
          {['iq-a', 'iq-b', 'iq-c', 'iq-d', 'iq-e'].map((id) => (
            <div
              key={id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}
      {!loading && inquiries.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No inquiries found
          </h3>
          <p className="text-gray-600">
            Inquiries will appear here as customers submit them.
          </p>
        </div>
      )}
      {!loading && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const config = statusConfig[inquiry.status] || statusConfig.NEW;
            const StatusIcon = config.icon;
            return (
              <div
                key={inquiry.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {inquiry.name}
                      </h3>
                      <Badge className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      {inquiry.source && (
                        <Badge variant="outline" className="text-xs">
                          {inquiry.source}
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{inquiry.phone}</span>
                        </div>
                        {inquiry.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{inquiry.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{inquiry.pg.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {inquiry.message && (
                        <div>
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5" />
                            <span className="line-clamp-2">
                              {inquiry.message}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {inquiry.status === 'NEW' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateInquiryStatus(inquiry.id, 'CONTACTED')
                        }
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Mark Contacted
                      </Button>
                    )}
                    {inquiry.status === 'CONTACTED' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateInquiryStatus(inquiry.id, 'CONVERTED')
                        }
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Convert
                      </Button>
                    )}
                    {(inquiry.status === 'NEW' ||
                      inquiry.status === 'CONTACTED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateInquiryStatus(inquiry.id, 'CLOSED')
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

