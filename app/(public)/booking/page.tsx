'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  IndianRupee,
  MapPin,
  BedDouble,
  Phone,
  ArrowLeft,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PG {
  id: string;
  name: string;
  area: string;
  city: string;
  state: string;
  startingPrice: number;
  securityDeposit: number;
  ownerPhone: string;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  maxOccupancy: number;
  monthlyRent: number;
  securityDeposit: number;
  hasAC: boolean;
  hasAttachedBath: boolean;
  hasBalcony: boolean;
}

const BookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get('pgId');
  const roomId = searchParams.get('roomId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pg, setPG] = useState<PG | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    checkInDate: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!pgId) {
        toast.error('PG ID is required');
        router.push('/rooms');
        return;
      }

      try {
        setLoading(true);

        const pgResponse = await fetch(`/api/pg/${pgId}`);
        if (!pgResponse.ok) {
          throw new Error('Failed to fetch PG details');
        }
        const pgData = await pgResponse.json();
        setPG(pgData);

        if (roomId) {
          const roomData = pgData.rooms?.find((r: Room) => r.id === roomId);
          if (roomData) {
            setRoom(roomData);
          } else {
            throw new Error('Room not found');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load booking details');
        router.push('/rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pgId, roomId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.checkInDate) {
      toast.error('Please select a check-in date');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pgId,
          roomId: roomId || undefined,
          checkInDate: new Date(formData.checkInDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const booking = await response.json();

      toast.success('Booking created successfully!');

      router.push(`/booking-confirmation?bookingId=${booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create booking',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!pgId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid booking request</p>
          <Link href="/rooms">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load PG details</p>
          <Link href="/rooms">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const monthlyRent = room ? room.monthlyRent : pg.startingPrice;
  const securityDeposit = room ? room.securityDeposit : pg.securityDeposit;
  const totalAmount = Number(monthlyRent) + Number(securityDeposit);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/pg/${pg.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to PG Details
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Stay
          </h1>
          <p className="text-gray-600">Complete your booking for {pg.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerPhone">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customerPhone"
                          value={formData.customerPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerPhone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email Address</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Check-in Date */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Check-in Date <span className="text-red-500">*</span>
                    </h3>
                    <Input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkInDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      placeholder="Any special requirements or questions..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? 'Creating Booking...' : 'Create Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{pg.name}</h4>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {pg.area}, {pg.city}, {pg.state}
                  </div>
                </div>

                {room && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BedDouble className="h-4 w-4" />
                      <span className="font-medium">
                        Room {room.roomNumber}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Type: {room.roomType}</p>
                      <p>Floor: {room.floor}</p>
                      <p>Max Occupancy: {room.maxOccupancy}</p>
                      <div className="flex gap-2 mt-2">
                        {room.hasAC && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            AC
                          </span>
                        )}
                        {room.hasAttachedBath && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Attached Bath
                          </span>
                        )}
                        {room.hasBalcony && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Balcony
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span>&#8377;{monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span>&#8377;{securityDeposit.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      &#8377;{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-gray-50 rounded p-3">
                  <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                  Security deposit is refundable at the time of checkout
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Call {pg.ownerPhone}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

