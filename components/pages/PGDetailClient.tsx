'use client';

import { useState } from 'react';
import { stegaClean } from '@sanity/client/stega';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Phone,
  Mail,
  Wifi,
  Utensils,
  Shield,
  Clock,
  BedDouble,
  Bath,
  Wind,
  CheckCircle,
  Users,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';
import { ContactOptionsDialog } from '@/components/ContactOptionsDialog';
import type { ContactDetailsData } from '@/lib/sanity/queries/contactDetails';
import type { SanityPG } from '@/lib/sanity/queries/pgSection';
import {
  usePGAvailability,
  useBookingValidation,
} from '@/lib/hooks/useAvailability';
import {
  formatRoomAvailabilityLabel,
  normalizeRoomAvailabilityStatus,
} from '@/lib/rooms/availability';

interface Props {
  pg: SanityPG;
  dbId: string;
  contactDetails?: ContactDetailsData | null;
}

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  RESERVED: 'bg-blue-100 text-blue-800',
};

const ROOM_TYPE_LABEL: Record<string, string> = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  TRIPLE: 'Triple',
  DORMITORY: 'Dormitory',
};

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

// Sub-component: validates price + availability before booking
function BookNowButton({
  pgId,
  roomId,
}: Readonly<{ pgId: string; roomId: string }>) {
  const router = useRouter();
  const { validation, isLoading } = useBookingValidation(pgId, roomId);
  const [checkingBeforeRedirect, setCheckingBeforeRedirect] = useState(false);

  const handleBookNow = async () => {
    try {
      setCheckingBeforeRedirect(true);

      const response = await fetch(
        `/api/booking/validate?pgId=${pgId}&roomId=${roomId}`,
      );
      const payload = await response.json();

      if (!response.ok || !payload.valid) {
        toast.error(
          payload.reason ?? 'This room is not available for checkout',
        );
        return;
      }

      router.push(
        `/booking?pgId=${pgId}&roomId=${roomId}&rent=${payload.monthlyRent}`,
      );
    } catch (error) {
      console.error('Error validating room before redirecting:', error);
      toast.error('Unable to verify room availability right now');
    } finally {
      setCheckingBeforeRedirect(false);
    }
  };

  if (isLoading || checkingBeforeRedirect) {
    return (
      <Button disabled size="sm" className="w-full">
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        Checking…
      </Button>
    );
  }

  if (!validation?.valid) {
    return (
      <Button disabled size="sm" variant="outline" className="w-full">
        {validation?.reason ?? 'Not Available'}
      </Button>
    );
  }

  return (
    <Button size="sm" className="w-full" onClick={handleBookNow}>
      Book ₹{validation.monthlyRent.toLocaleString()}/mo
    </Button>
  );
}

export function PGDetailClient({ pg, dbId, contactDetails }: Readonly<Props>) {
  // SWR: real-time room availability from backend
  const { availability, isLoading: availLoading } = usePGAvailability(dbId);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(
    null,
  );

  // Merge Sanity room list with real-time availability from backend
  const rooms = pg.rooms ?? [];
  const liveRooms =
    availability?.rooms.reduce<Record<string, (typeof availability.rooms)[0]>>(
      (acc, r) => {
        acc[r.id] = r;
        return acc;
      },
      {},
    ) ?? {};

  const handleInquire = (roomNumber?: string) => {
    setSelectedRoomNumber(roomNumber ?? null);
    setContactDialogOpen(true);
  };

  const pgName = cleanCmsString(pg.name);
  const pgAddress = cleanCmsString(pg.address);
  const pgArea = cleanCmsString(pg.area);
  const pgCity = cleanCmsString(pg.city);
  const pgDescription = cleanCmsString(pg.description);

  const coverImg = pg.images?.[0];
  const contactDialogTitle = selectedRoomNumber
    ? `Contact ${pgName} - Room ${selectedRoomNumber}`
    : `Contact ${pgName}`;
  const dialogContactDetails = {
    whatsappNumber: contactDetails?.whatsappNumber ?? null,
    phoneNumber: contactDetails?.phoneNumber ?? pg.ownerPhone ?? null,
    email: contactDetails?.email ?? pg.ownerEmail ?? null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            href="/pgs"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to all PGs
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-gray-200">
        {coverImg ? (
          <img
            src={coverImg.asset.url}
            alt={cleanCmsString(coverImg.alt) || pgName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <BedDouble className="h-24 w-24 text-blue-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold mb-1">{pgName}</h1>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            {pgAddress}, {pgArea}, {pgCity}
          </div>
        </div>
        {pg.verificationStatus === 'VERIFIED' && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content (left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {pg.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{pgDescription}</p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {pg.amenities && pg.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {pg.amenities.map((a) => (
                      <div
                        key={cleanCmsString(a.name)}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            a.available
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </div>
                        <span
                          className={
                            a.available
                              ? 'text-gray-800'
                              : 'text-gray-400 line-through'
                          }
                        >
                          {cleanCmsString(a.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Utilities */}
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      icon: <Wifi className="h-5 w-5" />,
                      label: 'WiFi',
                      ok: pg.wifiIncluded,
                    },
                    {
                      icon: <Utensils className="h-5 w-5" />,
                      label: 'Water',
                      ok: pg.waterIncluded,
                    },
                    {
                      icon: <Shield className="h-5 w-5" />,
                      label: 'Electricity',
                      ok: pg.electricityIncluded,
                    },
                  ].map((u) => (
                    <div
                      key={u.label}
                      className={`flex flex-col items-center p-3 rounded-lg text-sm ${
                        u.ok
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {u.icon}
                      <span className="mt-1">{u.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            <Card>
              <CardHeader>
                <CardTitle>House Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {pg.gateClosingTime && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Gate closes: {pg.gateClosingTime}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Smoking: {pg.smokingAllowed ? 'Allowed' : 'Not allowed'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Drinking: {pg.drinkingAllowed ? 'Allowed' : 'Not allowed'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image gallery */}
            {pg.images && pg.images.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {pg.images.slice(1).map((img, i) => (
                      <img
                        key={img.asset._id ?? i}
                        src={img.asset.url}
                        alt={img.alt ?? `Photo ${i + 1}`}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rooms Section — availability from SWR, details from Sanity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Available Rooms</span>
                  {availLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No room details available yet. Contact us for availability.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {rooms.map((room) => {
                      // Prefer real-time DB status; fall back to Sanity cached value
                      const live = liveRooms[room.dbId];
                      const status = normalizeRoomAvailabilityStatus(
                        live?.availabilityStatus ?? room.availabilityStatus,
                        live?.currentOccupancy ?? room.currentOccupancy,
                        live?.maxOccupancy ?? room.maxOccupancy,
                      );
                      const rent = live?.monthlyRent ?? room.monthlyRent;
                      const deposit =
                        live?.securityDeposit ?? room.securityDeposit;

                      return (
                        <div
                          key={room._id}
                          className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  Room {room.roomNumber}
                                </h4>
                                <Badge
                                  className={
                                    STATUS_STYLE[status] ??
                                    'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {formatRoomAvailabilityLabel(status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {ROOM_TYPE_LABEL[room.roomType]}
                                {room.roomSize
                                  ? ` · ${room.roomSize} sq ft`
                                  : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-blue-600">
                                ₹{rent?.toLocaleString()}/mo
                              </div>
                              <div className="text-xs text-gray-400">
                                Deposit ₹{deposit?.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {room.hasAC && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                AC
                              </span>
                            )}
                            {room.hasBalcony && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                Balcony
                              </span>
                            )}
                            {room.hasAttachedBath && (
                              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <Bath className="h-3 w-3" />
                                Attached Bath
                              </span>
                            )}
                            {room.hasFan && (
                              <span className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <Wind className="h-3 w-3" />
                                Fan
                              </span>
                            )}
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Max {room.maxOccupancy}
                            </span>
                          </div>

                          {/* Room images */}
                          {room.images && room.images.length > 0 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto">
                              {room.images.slice(0, 3).map((img, i) => (
                                <img
                                  key={img.asset._id ?? i}
                                  src={img.asset.url}
                                  alt={img.alt ?? `Room view ${i + 1}`}
                                  className="h-20 w-28 object-cover rounded-lg flex-shrink-0"
                                />
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleInquire(room.roomNumber)}
                            >
                              Inquire
                            </Button>
                            {/* Real-time booking button validates price+availability */}
                            <div className="flex-1">
                              <BookNowButton pgId={dbId} roomId={room.dbId} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick stats */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Rooms</span>
                  <span className="font-medium">
                    {availability?.totalRooms ?? pg.totalRooms}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Available Now</span>
                  <span className="font-semibold text-green-600">
                    {availability?.availableRooms ?? pg.availableRooms}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Starting Price</span>
                  <span className="font-bold text-blue-600">
                    ₹{pg.startingPrice.toLocaleString()}/mo
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact card */}
            {pg.ownerPhone && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pg.ownerName && (
                    <p className="font-medium text-gray-900">{pg.ownerName}</p>
                  )}
                  <a
                    href={`tel:${pg.ownerPhone}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {pg.ownerPhone}
                  </a>
                  {pg.ownerEmail && (
                    <a
                      href={`mailto:${pg.ownerEmail}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {pg.ownerEmail}
                    </a>
                  )}
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleInquire()}
                  >
                    Send Inquiry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ContactOptionsDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contactDetails={dialogContactDetails}
        title={contactDialogTitle}
        description="Choose WhatsApp or direct call to contact the property owner instantly."
      />
    </div>
  );
}

