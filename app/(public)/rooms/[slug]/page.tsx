import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Camera,
  IndianRupee,
  MapPin,
  Shield,
  Users,
  Wifi,
  Wind,
  Bath,
  Building2,
  Clock3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getRoomPageDetailBySlug,
  type SanityRoomPageDetail,
} from '@/lib/sanity/queries/roomSection';

export const revalidate = 60;

interface Props {
  params: Readonly<{ slug: string }>;
}

export default async function RoomDetailPage({ params }: Readonly<Props>) {
  const room = await getRoomPageDetailBySlug(params.slug);

  if (!room) {
    notFound();
  }

  const viewModel = buildRoomPageViewModel(room);

  return <RoomDetailContent room={room} viewModel={viewModel} />;
}

interface RoomPageViewModel {
  roomTitle: string;
  heroImage?:
    | SanityRoomPageDetail['images'][number]
    | SanityRoomPageDetail['heroImage'];
  galleryImages: NonNullable<SanityRoomPageDetail['images']>;
  roomFeatures: string[];
  roomContent: string[];
  pgContent: string[];
  checkoutHref: string | null;
  canCheckout: boolean;
  inquireHref: string;
  roomTypeLabel: string;
  availabilityLabel: string;
  genderLabel: string | null;
}

function RoomDetailContent({
  room,
  viewModel,
}: Readonly<{
  room: SanityRoomPageDetail;
  viewModel: RoomPageViewModel;
}>) {
  const {
    roomTitle,
    heroImage,
    galleryImages,
    roomFeatures,
    roomContent,
    pgContent,
    checkoutHref,
    canCheckout,
    inquireHref,
    roomTypeLabel,
    availabilityLabel,
    genderLabel,
  } = viewModel;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#ffffff_30%,#f8fafc_100%)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/rooms"
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all rooms
        </Link>

        <HeroPanel room={room} viewModel={viewModel} />
                    </Link>
        <GallerySection images={galleryImages} roomTitle={roomTitle} />
                  {image.caption ? (
                    <p className="border-t border-gray-200 px-3 py-2 text-sm text-gray-600">
                      {image.caption}
            <RoomDetailsSection room={room} roomContent={roomContent} />
            <PGDetailsSection room={room} pgContent={pgContent} genderLabel={genderLabel} />
                    : null}
                </div>
          <SidebarSection room={room} viewModel={viewModel} />
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </section>

function HeroPanel({
  room,
  viewModel,
}: Readonly<{
  room: SanityRoomPageDetail;
  viewModel: RoomPageViewModel;
}>) {
  const {
    heroImage,
    roomTitle,
    roomTypeLabel,
    availabilityLabel,
    roomFeatures,
    checkoutHref,
    canCheckout,
    inquireHref,
  } = viewModel;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="border-b border-gray-200 bg-gray-100 lg:border-b-0 lg:border-r">
          {heroImage?.asset.url ? (
            <img
              src={heroImage.asset.url}
              alt={heroImage.alt ?? roomTitle}
              className="h-full min-h-[320px] w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <BedDouble className="h-20 w-20 text-blue-200" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {roomTypeLabel}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {availabilityLabel}
            </span>
            {room.featured ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                <Shield className="mr-1 h-3.5 w-3.5" />
                Featured
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{roomTitle}</h1>

          <HeroMeta room={room} />

          <div className="mt-6 flex items-center text-3xl font-bold text-blue-600">
            <IndianRupee className="h-6 w-6" />
            {room.monthlyRent.toLocaleString()}
            <span className="ml-2 text-sm font-medium text-gray-500">
              per month
            </span>
          </div>

          {room.description ? (
            <p className="mt-6 text-base leading-7 text-gray-700">{room.description}</p>
          ) : null}

          {roomFeatures.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {roomFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          ) : null}

          <ActionButtons
            canCheckout={canCheckout}
            checkoutHref={checkoutHref}
            inquireHref={inquireHref}
            pgSlug={room.pgReference?.slug?.current}
          />
        </div>
      </div>
    </div>
  );
}

function HeroMeta({ room }: Readonly<{ room: SanityRoomPageDetail }>) {
  const locationParts = [
    room.pgReference?.name,
    room.pgReference?.area,
    room.pgReference?.city,
  ].filter(Boolean);

  return (
    <div className="mt-3 space-y-2 text-sm text-gray-600">
      {locationParts.length > 0 ? (
        <p className="flex items-center">
          <MapPin className="mr-2 h-4 w-4" />
          {locationParts.join(' • ')}
        </p>
      ) : null}
      <p className="flex items-center">
        <Users className="mr-2 h-4 w-4" />
        Up to {room.maxOccupancy} residents
      </p>
      {room.availableFrom ? (
        <p className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          Available from {formatDate(room.availableFrom)}
        </p>
      ) : null}
    </div>
  );
}

function ActionButtons({
  canCheckout,
  checkoutHref,
  inquireHref,
  pgSlug,
}: Readonly<{
  canCheckout: boolean;
  checkoutHref: string | null;
  inquireHref: string;
  pgSlug?: string;
}>) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {canCheckout && checkoutHref ? (
        <Button asChild size="lg" className="min-w-[160px]">
          <Link href={checkoutHref}>Checkout</Link>
        </Button>
      ) : (
        <Button size="lg" disabled className="min-w-[160px]">
          Checkout Unavailable
        </Button>
      )}
      <Button asChild size="lg" variant="outline" className="min-w-[160px]">
        <Link href={inquireHref}>Inquire</Link>
      </Button>
      {pgSlug ? (
        <Button asChild size="lg" variant="ghost">
          <Link href={`/pg/${pgSlug}`}>View PG Details</Link>
        </Button>
      ) : null}
    </div>
  );
}

function GallerySection({
  images,
  roomTitle,
}: Readonly<{
  images: NonNullable<SanityRoomPageDetail['images']>;
  roomTitle: string;
}>) {
  if (images.length <= 1) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Camera className="h-5 w-5 text-gray-500" />
        More Images
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.asset._id} className="overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={image.asset.url}
              alt={image.alt ?? roomTitle}
              className="h-48 w-full object-cover"
            />
            {image.caption ? (
              <p className="border-t border-gray-200 px-3 py-2 text-sm text-gray-600">
                {image.caption}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function RoomDetailsSection({
  room,
  roomContent,
}: Readonly<{
  room: SanityRoomPageDetail;
  roomContent: string[];
}>) {
  const hasRoomDetails =
    Boolean(room.amenities?.length) || Boolean(room.features?.length) || roomContent.length > 0;

  if (!hasRoomDetails) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Room Details</h2>

      {room.amenities && room.amenities.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Amenities
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {room.features && room.features.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {room.features.map((feature) => (
            <div key={feature.name} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-gray-900">{feature.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${feature.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {feature.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {feature.description ? (
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {roomContent.length > 0 ? (
        <div className="mt-6 space-y-4 text-gray-700">
          {roomContent.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PGDetailsSection({
  room,
  pgContent,
  genderLabel,
}: Readonly<{
  room: SanityRoomPageDetail;
  pgContent: string[];
  genderLabel: string | null;
}>) {
  if (!room.pgReference) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
        <Building2 className="h-5 w-5 text-gray-500" />
        PG Details
      </div>

      {room.pgReference.description ? (
        <p className="mt-4 text-gray-700">{room.pgReference.description}</p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {room.pgReference.ownerName ? renderMetaCard('Owner', room.pgReference.ownerName) : null}
        {genderLabel ? renderMetaCard('For', genderLabel) : null}
        {room.pgReference.ownerPhone ? renderMetaCard('Phone', room.pgReference.ownerPhone) : null}
        {room.pgReference.ownerEmail ? renderMetaCard('Email', room.pgReference.ownerEmail) : null}
        {room.pgReference.gateClosingTime ? renderMetaCard('Gate Closing', room.pgReference.gateClosingTime) : null}
        {room.pgReference.address
          ? renderMetaCard(
              'Location',
              [
                room.pgReference.address,
                room.pgReference.area,
                room.pgReference.city,
                room.pgReference.state,
                room.pgReference.pincode,
              ]
                .filter(Boolean)
                .join(', '),
            )
          : null}
      </div>

      {room.pgReference.amenities && room.pgReference.amenities.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            PG Amenities
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {room.pgReference.amenities
              .filter((amenity) => amenity.available)
              .map((amenity) => (
                <div key={amenity.name} className="rounded-2xl border border-gray-200 p-4">
                  <div className="font-medium text-gray-900">{amenity.name}</div>
                  {amenity.description ? (
                    <p className="mt-1 text-sm text-gray-600">{amenity.description}</p>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {pgContent.length > 0 ? (
        <div className="mt-6 space-y-4 text-gray-700">
          {pgContent.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SidebarSection({
  room,
  viewModel,
}: Readonly<{
  room: SanityRoomPageDetail;
  viewModel: RoomPageViewModel;
}>) {
  const { roomTypeLabel, availabilityLabel } = viewModel;

  return (
    <aside className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Quick Facts</h2>
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          {renderFact('Sharing Type', roomTypeLabel)}
          {renderFact('Availability', availabilityLabel)}
          {room.roomSize ? renderFact('Room Size', `${room.roomSize} sq ft`) : null}
          {renderFact('Max Occupancy', `${room.maxOccupancy} residents`)}
          {room.currentOccupancy > 0
            ? renderFact('Current Occupancy', `${room.currentOccupancy} residents`)
            : null}
          {room.floor ? renderFact('Floor', `Floor ${room.floor}`) : null}
          {room.windowDirection ? renderFact('Window', formatEnumLabel(room.windowDirection)) : null}
          {room.securityDeposit ? renderFact('Deposit', `₹${room.securityDeposit.toLocaleString()}`) : null}
          {room.maintenanceCharges ? renderFact('Maintenance', `₹${room.maintenanceCharges.toLocaleString()}`) : null}
        </div>
      </section>

      {room.pgReference ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">PG Inclusions</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            {room.pgReference.wifiIncluded ? renderIconFact(Wifi, 'WiFi included') : null}
            {room.pgReference.electricityIncluded ? renderIconFact(Wind, 'Electricity included') : null}
            {room.hasAttachedBath ? renderIconFact(Bath, 'Attached bathroom') : null}
            {room.pgReference.gateClosingTime
              ? renderIconFact(Clock3, `Gate closes at ${room.pgReference.gateClosingTime}`)
              : null}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
            ) : null}
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Facts
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {renderFact('Sharing Type', roomTypeLabel)}
                {renderFact('Availability', availabilityLabel)}
                {room.roomSize
                  ? renderFact('Room Size', `${room.roomSize} sq ft`)
                  : null}
                {renderFact('Max Occupancy', `${room.maxOccupancy} residents`)}
                {room.currentOccupancy > 0
                  ? renderFact(
                      'Current Occupancy',
                      `${room.currentOccupancy} residents`,
                    )
                  : null}
                {room.floor ? renderFact('Floor', `Floor ${room.floor}`) : null}
                {room.windowDirection
                  ? renderFact('Window', formatEnumLabel(room.windowDirection))
                  : null}
                {room.securityDeposit
                  ? renderFact(
                      'Deposit',
                      `₹${room.securityDeposit.toLocaleString()}`,
                    )
                  : null}
                {room.maintenanceCharges
                  ? renderFact(
                      'Maintenance',
                      `₹${room.maintenanceCharges.toLocaleString()}`,
                    )
                  : null}
              </div>
            </section>

            {room.pgReference ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  PG Inclusions
                </h2>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  {room.pgReference.wifiIncluded
                    ? renderIconFact(Wifi, 'WiFi included')
                    : null}
                  {room.pgReference.electricityIncluded
                    ? renderIconFact(Wind, 'Electricity included')
                    : null}
                  {room.hasAttachedBath
                    ? renderIconFact(Bath, 'Attached bathroom')
                    : null}
                  {room.pgReference.gateClosingTime
                    ? renderIconFact(
                        Clock3,
                        `Gate closes at ${room.pgReference.gateClosingTime}`,
                      )
                    : null}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function buildRoomPageViewModel(room: SanityRoomPageDetail): RoomPageViewModel {
  const roomTitle = room.title || `Room ${room.roomNumber}`;
  const heroImage =
    room.heroImage || room.images?.[0] || room.pgReference?.images?.[0];
  const galleryImages = [
    ...(room.heroImage ? [room.heroImage] : []),
    ...(room.images ?? []),
  ].filter(
    (image, index, images) =>
      Boolean(image?.asset?.url) &&
      images.findIndex(
        (candidate) => candidate?.asset?._id === image?.asset?._id,
      ) === index,
  ) as NonNullable<SanityRoomPageDetail['images']>;
  const roomFeatures = [
    room.hasAttachedBath ? 'Attached Bath' : null,
    room.hasAC ? 'AC' : null,
    room.hasBalcony ? 'Balcony' : null,
    room.hasFan ? 'Ceiling Fan' : null,
  ].filter(Boolean);
  const roomContent = extractPortableTextParagraphs(room.content);
  const pgContent = extractPortableTextParagraphs(room.pgReference?.content);
  const checkoutHref =
    room.pgReference?.dbId && room.dbId
      ? `/booking?pgId=${room.pgReference.dbId}&roomId=${room.dbId}&rent=${room.monthlyRent}`
      : null;

  return {
    roomTitle,
    heroImage,
    galleryImages,
    roomFeatures,
    roomContent,
    pgContent,
    checkoutHref,
    canCheckout:
      room.availabilityStatus === 'AVAILABLE' && Boolean(checkoutHref),
    inquireHref: getInquireHref(room),
    roomTypeLabel: formatEnumLabel(room.roomType),
    availabilityLabel: formatEnumLabel(room.availabilityStatus),
    genderLabel: room.pgReference?.genderRestriction
      ? formatEnumLabel(room.pgReference.genderRestriction)
      : null,
  };
}

function getInquireHref(room: SanityRoomPageDetail) {
  if (room.pgReference?.ownerPhone) {
    return `tel:${room.pgReference.ownerPhone}`;
  }

  if (room.pgReference?.ownerEmail) {
    return `mailto:${room.pgReference.ownerEmail}`;
  }

  if (room.pgReference?.slug?.current) {
    return `/pg/${room.pgReference.slug.current}`;
  }

  return '/contact';
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function extractPortableTextParagraphs(
  blocks?: SanityRoomPageDetail['content'],
) {
  if (!blocks || blocks.length === 0) {
    return [];
  }

  return blocks
    .map((block) =>
      (block.children ?? [])
        .map((child) => child.text?.trim() ?? '')
        .filter(Boolean)
        .join(' ')
        .trim(),
    )
    .filter(Boolean);
}

function renderFact(label: string, value: string) {
  return (
    <div
      key={label}
      className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
    >
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

function renderIconFact(Icon: typeof Wifi, label: string) {
  return (
    <div key={label} className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-500" />
      <span>{label}</span>
    </div>
  );
}

function renderMetaCard(label: string, value: string) {
  return (
    <div key={label} className="rounded-2xl border border-gray-200 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

