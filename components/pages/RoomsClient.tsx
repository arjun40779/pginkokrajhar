'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BedDouble,
  CheckCircle,
  IndianRupee,
  MapPin,
  Phone,
  Search,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SanityRoomWithPG } from '@/lib/sanity/queries/roomSection';
import {
  formatRoomAvailabilityLabel,
  isRoomAvailableForBooking,
} from '@/lib/rooms/availability';

interface RoomsClientProps {
  initialRooms: SanityRoomWithPG[];
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single Sharing',
  DOUBLE: 'Double Sharing',
  TRIPLE: 'Triple Sharing',
  DORMITORY: 'Dormitory',
};

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: 'bg-white/90 text-green-700',
  OCCUPIED: 'bg-white/90 text-red-700',
  MAINTENANCE: 'bg-white/90 text-orange-700',
  RESERVED: 'bg-white/90 text-blue-700',
};

export function RoomsClient({ initialRooms }: Readonly<RoomsClientProps>) {
  const [search, setSearch] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [inquiryDialog, setInquiryDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<SanityRoomWithPG | null>(
    null,
  );
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return initialRooms.filter((room) => {
      const matchesType =
        roomTypeFilter === 'all' || room.roomType === roomTypeFilter;

      if (!matchesType) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        room.roomNumber,
        room.title,
        room.description,
        room.roomType,
        ROOM_TYPE_LABELS[room.roomType],
        room.pgReference?.name,
        room.pgReference?.area,
        room.pgReference?.city,
        ...(room.amenities ?? []),
        ...(room.features?.map((feature) => feature.name) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableValues.includes(normalizedSearch);
    });
  }, [initialRooms, roomTypeFilter, search]);

  const handleInquire = (room: SanityRoomWithPG) => {
    setSelectedRoom(room);
    setInquiryDialog(true);
  };

  const selectedRoomLabel = selectedRoom
    ? selectedRoom.title || `Room ${selectedRoom.roomNumber}`
    : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedRoom?.pgReference?.dbId) {
      toast.error('This room is missing a PG reference.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pgId: selectedRoom.pgReference.dbId,
          message: [form.message, `Room inquiry: ${selectedRoomLabel}`]
            .filter(Boolean)
            .join('\n\n'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      toast.success("Inquiry submitted! We'll contact you soon.");
      setInquiryDialog(false);
      setSelectedRoom(null);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Our Rooms & Accommodation
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Browse all available rooms across our PG properties and find the
            setup that fits your budget and sharing preference.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <div className="relative w-80 max-w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search room type, title, description, PG, area..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          {['all', 'SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'].map((type) => (
            <Button
              key={type}
              variant={roomTypeFilter === type ? 'default' : 'outline'}
              onClick={() => setRoomTypeFilter(type)}
              className="capitalize"
            >
              {type === 'all' ? 'All Rooms' : ROOM_TYPE_LABELS[type]}
            </Button>
          ))}
        </div>

        <p className="mb-6 text-center text-sm text-gray-500">
          {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'}{' '}
          found
        </p>

        {filteredRooms.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <BedDouble className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium">No rooms found</p>
            <p className="mt-1 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => {
              const thumbnail =
                room.images?.[0] || room.pgReference?.images?.[0];
              const imageUrl = thumbnail?.asset.url;
              const roomLabel = room.title || `Room ${room.roomNumber}`;
              const pgName = room.pgReference?.name || 'PG Property';
              const location = [room.pgReference?.area, room.pgReference?.city]
                .filter(Boolean)
                .join(', ');
              const shortAmenities = room.amenities?.slice(0, 4) ?? [];

              return (
                <div
                  key={room._id}
                  className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={thumbnail?.alt ?? roomLabel}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <BedDouble className="h-16 w-16 text-blue-200" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <Badge className="bg-blue-600">
                        {ROOM_TYPE_LABELS[room.roomType]}
                      </Badge>
                    </div>

                    <div className="absolute right-3 top-3">
                      {(() => {
                        const isAvailable = isRoomAvailableForBooking(
                          room.availabilityStatus,
                          room.currentOccupancy,
                          room.maxOccupancy,
                        );
                        const statusLabel = formatRoomAvailabilityLabel(
                          room.availabilityStatus,
                          room.currentOccupancy,
                          room.maxOccupancy,
                        );

                        return (
                          <Badge
                            variant="secondary"
                            className={
                              STATUS_STYLE[
                                isAvailable
                                  ? 'AVAILABLE'
                                  : statusLabel.toUpperCase()
                              ] ?? 'bg-white/90 text-gray-700'
                            }
                          >
                            {isAvailable ? (
                              <span className="flex items-center">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Available
                              </span>
                            ) : (
                              statusLabel
                            )}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {roomLabel}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {pgName}
                        </p>
                      </div>
                    </div>

                    {location ? (
                      <div className="mb-3 flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                        {location}
                      </div>
                    ) : null}

                    {room.description ? (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {room.description}
                      </p>
                    ) : null}

                    {shortAmenities.length > 0 ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {shortAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities && room.amenities.length > 4 ? (
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            +{room.amenities.length - 4} more
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mb-4 flex items-center justify-between border-t pt-4">
                      <div className="flex items-center text-gray-600">
                        <Users className="mr-1 h-4 w-4" />
                        <span className="text-sm">
                          Up to {room.maxOccupancy} persons
                        </span>
                      </div>
                      <div className="flex items-center text-2xl font-bold text-blue-600">
                        <IndianRupee className="h-5 w-5" />
                        {room.monthlyRent.toLocaleString()}
                        <span className="ml-1 text-sm text-gray-500">
                          /month
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleInquire(room)}
                      >
                        <Phone className="mr-1 h-3.5 w-3.5" />
                        Inquire
                      </Button>
                      <Link
                        href={`/rooms/${room.slug.current}`}
                        className="flex-1"
                      >
                        <Button className="w-full">View Room</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={inquiryDialog} onOpenChange={setInquiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquire about {selectedRoomLabel}</DialogTitle>
            <DialogDescription>
              We&apos;ll reach out within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div>
              <Label htmlFor="inq-name">Full Name *</Label>
              <Input
                id="inq-name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="inq-phone">Phone *</Label>
              <Input
                id="inq-phone"
                type="tel"
                required
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="inq-email">Email</Label>
              <Input
                id="inq-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="optional"
              />
            </div>
            <div>
              <Label htmlFor="inq-msg">Message</Label>
              <Textarea
                id="inq-msg"
                rows={3}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Any specific requirements?"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setInquiryDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

