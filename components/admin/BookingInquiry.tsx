import { useState } from 'react';
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
  email: string;
  phone: string;
  pgName: string;
  roomType: string;
  message: string;
  date: string;
  status: 'Pending' | 'Contacted' | 'Converted' | 'Rejected';
}

const initialInquiries: Inquiry[] = [
  {
    id: '1',
    name: 'Ananya Desai',
    email: 'ananya@email.com',
    phone: '+91 9876543214',
    pgName: 'Sunrise PG',
    roomType: 'Single',
    message:
      'Looking for a single room with AC. When is the earliest I can move in?',
    date: '2026-03-28',
    status: 'Pending',
  },
  {
    id: '2',
    name: 'Vikram Singh',
    email: 'vikram@email.com',
    phone: '+91 9876543215',
    pgName: 'Green Valley PG',
    roomType: 'Double',
    message:
      'Interested in a double sharing room. Need parking space for bike.',
    date: '2026-03-27',
    status: 'Contacted',
  },
  {
    id: '3',
    name: 'Neha Kapoor',
    email: 'neha@email.com',
    phone: '+91 9876543216',
    pgName: 'City Center PG',
    roomType: 'Single',
    message:
      'Looking for accommodation close to Koramangala. Budget around 10k.',
    date: '2026-03-26',
    status: 'Converted',
  },
  {
    id: '4',
    name: 'Arjun Reddy',
    email: 'arjun@email.com',
    phone: '+91 9876543217',
    pgName: 'Sunrise PG',
    roomType: 'Triple',
    message: 'Need a budget room for 3 months. Any discounts for short term?',
    date: '2026-03-25',
    status: 'Rejected',
  },
  {
    id: '5',
    name: 'Divya Sharma',
    email: 'divya@email.com',
    phone: '+91 9876543218',
    pgName: 'Green Valley PG',
    roomType: 'Single',
    message: 'Working professional. Need a quiet room with good WiFi.',
    date: '2026-03-24',
    status: 'Contacted',
  },
];

export function BookingInquiry() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const updateStatus = (id: string, status: Inquiry['status']) => {
    setInquiries(
      inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
    );
    if (selectedInquiry?.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Contacted':
        return <MessageSquare className="w-4 h-4" />;
      case 'Converted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

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
          {inquiries.map((inquiry) => (
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
                    {inquiry.pgName} - {inquiry.roomType}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(inquiry.status)}`}
                  >
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(inquiry.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                {inquiry.message}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {inquiry.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {inquiry.email}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          {selectedInquiry ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Inquiry Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Name
                  </label>
                  <p className="text-gray-900 mt-1">{selectedInquiry.name}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </label>
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
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${selectedInquiry.email}`}
                        className="hover:text-blue-600"
                      >
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Property & Room Type
                  </label>
                  <p className="text-gray-900 mt-1">{selectedInquiry.pgName}</p>
                  <p className="text-gray-600 text-sm">
                    {selectedInquiry.roomType} Room
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Date
                  </label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedInquiry.date).toLocaleDateString(
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
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Message
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedInquiry.message}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase block mb-3">
                    Update Status
                  </label>
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        updateStatus(selectedInquiry.id, 'Contacted')
                      }
                      variant="outline"
                      className="w-full justify-start"
                      disabled={selectedInquiry.status === 'Contacted'}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mark as Contacted
                    </Button>
                    <Button
                      onClick={() =>
                        updateStatus(selectedInquiry.id, 'Converted')
                      }
                      variant="outline"
                      className="w-full justify-start text-green-600 hover:text-green-700"
                      disabled={selectedInquiry.status === 'Converted'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Converted
                    </Button>
                    <Button
                      onClick={() =>
                        updateStatus(selectedInquiry.id, 'Rejected')
                      }
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      disabled={selectedInquiry.status === 'Rejected'}
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

