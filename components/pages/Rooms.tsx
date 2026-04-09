'use client';

import { useEffect, useMemo, useState } from 'react';
import { stegaClean } from '@sanity/client/stega';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, IndianRupee, Users, Bed } from 'lucide-react';
import { ContactOptionsDialog } from '@/components/ContactOptionsDialog';
import type { ContactDetailsData } from '@/lib/sanity/queries/contactDetails';
import type { RoomPricingIncludesSectionData } from '@/lib/sanity/queries/roomSection';
import {
  formatRoomAvailabilityLabel,
  isRoomAvailableForBooking,
} from '@/lib/rooms/availability';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export type Room = {
  _id: string;
  dbId: string;
  title?: string;
  description?: string;
  roomType: string;
  maxOccupancy: number;
  currentOccupancy?: number;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  featured: boolean;
  availabilityStatus: string;
  amenities?: string[];
  slug: {
    current: string;
  };
  heroImage?: {
    asset: {
      _id: string;
      url: string;
    };
  } | null;
};

const LEGACY_ROOM_FILTER_LABELS: Record<string, string> = {
  single: 'single Sharing',
  double: 'double Sharing',
  triple: 'triple Sharing',
  dormitory: 'dormitory Sharing',
};

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

export function Rooms({
  data,
  pricingIncludesSection,
  contactDetails,
  title = 'Our Rooms & Accommodation',
  description = 'Choose from our wide range of single, double, and triple sharing rooms with modern amenities.',
}: Readonly<{
  data: Room[];
  pricingIncludesSection?: RoomPricingIncludesSectionData | null;
  contactDetails?: ContactDetailsData | null;
  title?: string;
  description?: string;
}>) {
  const [filterType, setFilterType] = useState<string>('all');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedRoomLabel, setSelectedRoomLabel] = useState('');

  const availableFilterTypes = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((room) => cleanCmsString(room.roomType).toLowerCase())
            .filter((roomType): roomType is string => Boolean(roomType)),
        ),
      ),
    [data],
  );

  useEffect(() => {
    if (filterType !== 'all' && !availableFilterTypes.includes(filterType)) {
      setFilterType('all');
    }
  }, [availableFilterTypes, filterType]);

  const filteredRooms = useMemo(
    () =>
      filterType === 'all'
        ? data
        : data.filter(
            (room) =>
              cleanCmsString(room.roomType).toLowerCase() ===
              filterType.toLowerCase(),
          ),
    [data, filterType],
  );

  const handleInquiry = (roomTitle: string) => {
    setSelectedRoomLabel(roomTitle);
    setContactDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{title}</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {description}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {['all', ...availableFilterTypes].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              className={`capitalize ${filterType === type ? 'bg-black text-white' : ''}`}
            >
              {type === 'all'
                ? 'All Rooms'
                : (LEGACY_ROOM_FILTER_LABELS[type] ?? `${type} Sharing`)}
            </Button>
          ))}
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms?.map((room) => {
            const isAvailable = isRoomAvailableForBooking(
              room.availabilityStatus,
              room.currentOccupancy,
              room.maxOccupancy,
            );
            const roomTitle = cleanCmsString(room.title);
            const roomDescription = cleanCmsString(room.description);
            const roomType = cleanCmsString(room.roomType);
            const roomSlug = cleanCmsString(room.slug?.current);
            const roomLabel = roomTitle || `Room ${roomSlug}`;

            return (
              <div
                key={room._id}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-xl"
              >
                <div className="relative">
                  {room?.heroImage?.asset?.url ? (
                    <Image
                      src={room?.heroImage?.asset?.url}
                      alt={roomTitle}
                      className="h-48 w-full object-cover"
                      height={192}
                      width={384}
                    />
                  ) : (
                    <Bed className="h-48 w-full object-cover text-blue-300" />
                  )}

                  <div className="absolute right-3 top-3">
                    <Badge
                      variant={isAvailable ? 'default' : 'destructive'}
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      {isAvailable ? (
                        <span className="flex items-center text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Available
                        </span>
                      ) : (
                        <span className="text-red-700">
                          {formatRoomAvailabilityLabel(room.availabilityStatus)}
                        </span>
                      )}
                    </Badge>
                  </div>

                  <div className="absolute left-3 top-3">
                    <Badge className="bg-blue-600 text-white">
                      {roomType
                        ? `${roomType.charAt(0).toUpperCase()}${roomType
                            .slice(1)
                            .toLowerCase()}`
                        : ''}{' '}
                      Sharing
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      {roomTitle}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      {roomDescription}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {room?.amenities?.slice(0, 4)?.map((amenity) => (
                        <span
                          key={cleanCmsString(amenity)}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {cleanCmsString(amenity)}
                        </span>
                      ))}
                      {room?.amenities?.length &&
                      room?.amenities?.length > 4 ? (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          +{room?.amenities?.length - 4} more
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
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
                        onClick={() => handleInquiry(roomLabel)}
                      >
                        Inquire
                      </Button>

                      {isAvailable ? (
                        <Link href={`/rooms/${roomSlug}`} className="flex-1">
                          <Button className="w-full bg-black text-white">
                            Book Now
                          </Button>
                        </Link>
                      ) : (
                        <Button className="flex-1" disabled>
                          Not Available
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {pricingIncludesSection?.roomAmenities &&
        pricingIncludesSection?.commonFacilities ? (
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              What's Included in the Price?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Room Amenities
                </h3>
                <ul className="space-y-2">
                  {pricingIncludesSection?.roomAmenities?.map((item) => (
                    <li key={item} className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700">
                        {cleanCmsString(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Common Facilities
                </h3>
                <ul className="space-y-2">
                  {pricingIncludesSection?.commonFacilities?.map((item) => (
                    <li key={item} className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700">
                        {cleanCmsString(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <ContactOptionsDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contactDetails={contactDetails}
        title={`Contact for ${selectedRoomLabel || 'this room'}`}
        description="Choose WhatsApp or direct call to ask about this room."
      />
    </div>
  );
}

