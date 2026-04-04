import { stegaClean } from '@sanity/client/stega';
import Link from 'next/link';
import { Building2, CheckCircle, IndianRupee, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPGRoomsPath } from '@/lib/pgs/publicPath';
import type { SanityPG } from '@/lib/sanity/queries/pgSection';

interface PGCardGridProps {
  pgs: SanityPG[];
  emptyTitle?: string;
  emptyDescription?: string;
}

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

export function PGCardGrid({
  pgs,
  emptyTitle = 'No PGs are live yet',
  emptyDescription = 'New properties will appear here once the admin sync is complete and the listing is activated in Sanity.',
}: Readonly<PGCardGridProps>) {
  if (pgs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
        <Building2 className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          {emptyTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {pgs.map((pg) => {
        const heroImage = pg.images?.[0];
        const pgName = cleanCmsString(pg.name) || 'PG Property';
        const description = cleanCmsString(pg.description);
        const location = [
          cleanCmsString(pg.area),
          cleanCmsString(pg.city),
          cleanCmsString(pg.state),
        ]
          .filter(Boolean)
          .join(', ');
        const highlights =
          pg.amenities
            ?.filter((amenity) => amenity.available)
            .slice(0, 3)
            .map((amenity) => cleanCmsString(amenity.name))
            .filter(Boolean) ?? [];
        const roomsPath = getPGRoomsPath(pg.slug, pg.dbId);

        return (
          <article
            key={pg._id}
            className="overflow-hidden rounded-lg    border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100">
              {heroImage?.asset?.url ? (
                <img
                  src={heroImage.asset.url}
                  alt={cleanCmsString(heroImage.alt) || pgName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 via-white to-emerald-100">
                  <Building2 className="h-16 w-16 text-slate-300" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

              <div className="absolute left-4 top-4 flex gap-2">
                {pg.verificationStatus === 'VERIFIED' ? (
                  <Badge className="gap-1 bg-emerald-500 text-white">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                ) : null}
                {pg.featured ? (
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-slate-800"
                  >
                    Featured
                  </Badge>
                ) : null}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-semibold">{pgName}</h3>
                {location ? (
                  <p className="mt-2 flex items-center text-sm text-slate-100">
                    <MapPin className="mr-2 h-4 w-4" />
                    {location}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-5 p-6">
              {description ? (
                <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Explore room availability, pricing, and amenities for this
                  property.
                </p>
              )}

              {highlights.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 rounded-md bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Starting From
                  </p>
                  <p className="mt-2 flex items-center text-2xl font-semibold text-slate-900">
                    <IndianRupee className="h-5 w-5" />
                    {Number(pg.startingPrice || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Availability
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">
                    {pg.availableRooms}
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      / {pg.totalRooms} rooms
                    </span>
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="w-full rounded-md bg-slate-900 text-white hover:bg-slate-800"
              >
                <Link href={roomsPath}>View Rooms</Link>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

