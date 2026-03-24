'use client';
import { useState, useEffect } from 'react';
import { rooms } from '../data/roomsData';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CheckCircle, Users, IndianRupee, Wifi, Wind, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function Rooms() {
  const [isClient, setIsClient] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [inquiryDialog, setInquiryDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading skeleton during SSR and initial hydration
  if (!isClient) {
    return (
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-10 w-80 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredRooms =
    filterType === 'all'
      ? rooms
      : rooms.filter(
          (room) => room.type.toLowerCase() === filterType.toLowerCase(),
        );

  const handleInquiry = (roomId: string) => {
    setSelectedRoom(roomId);
    setInquiryDialog(true);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to backend
    toast.success("Inquiry submitted successfully! We'll contact you soon.");
    setInquiryDialog(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Rooms & Accommodation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of single, double, and triple sharing
            rooms with modern amenities
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {['all', 'single', 'double', 'triple'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type === 'all' ? 'All Rooms' : `${type} Sharing`}
            </Button>
          ))}
        </div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Room Image */}
              <div className="relative">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={room.available ? 'default' : 'destructive'}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    {room.available ? (
                      <span className="flex items-center text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </span>
                    ) : (
                      <span className="text-red-700">Occupied</span>
                    )}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-blue-600">{room.type} Sharing</Badge>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {room.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{room.description}</p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 4).map((amenity, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>

                {/* Price and Capacity */}
                <div className="flex items-center justify-between mb-4 pt-4 border-t">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Up to {room.capacity} persons
                    </span>
                  </div>
                  <div className="flex items-center text-2xl font-bold text-blue-600">
                    <IndianRupee className="h-5 w-5" />
                    {room.price.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">/month</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleInquiry(room.id)}
                  >
                    Inquire
                  </Button>
                  {room.available ? (
                    <Link href={`/payment/${room.id}`} className="flex-1">
                      <Button className="w-full">Book Now</Button>
                    </Link>
                  ) : (
                    <Button className="flex-1" disabled>
                      Not Available
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What's Included in the Price?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Room Amenities
              </h3>
              <ul className="space-y-2">
                {[
                  'Fully furnished room with bed and mattress',
                  'Study table and chair',
                  'Wardrobe for personal storage',
                  '24/7 high-speed WiFi',
                  'AC/Fan (based on room type)',
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Common Facilities
              </h3>
              <ul className="space-y-2">
                {[
                  '3 times nutritious meals',
                  '24/7 security and CCTV surveillance',
                  'Laundry service with washing machine',
                  'Power backup for uninterrupted supply',
                  'Common room and recreational area',
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialog} onOpenChange={setInquiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquire About Room Availability</DialogTitle>
            <DialogDescription>
              Fill in your details and we'll get back to you within 24 hours
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitInquiry} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Any specific requirements or questions?"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setInquiryDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Submit Inquiry
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

