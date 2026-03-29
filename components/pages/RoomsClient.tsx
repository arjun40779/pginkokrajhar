'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MapPin,
  Search,
  Users,
  BedDouble,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SanityPG } from '@/lib/sanity/queries/pgSection';

interface RoomsClientProps {
  initialPGs: SanityPG[];
}

const GENDER_LABELS: Record<string, string> = {
  BOYS: 'Boys Only',
  GIRLS: 'Girls Only',
  COED: 'Co-ed',
};

const GENDER_COLORS: Record<string, string> = {
  BOYS: 'bg-blue-100 text-blue-800',
  GIRLS: 'bg-pink-100 text-pink-800',
  COED: 'bg-purple-100 text-purple-800',
};

export function RoomsClient({ initialPGs }: Readonly<RoomsClientProps>) {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [inquiryDialog, setInquiryDialog] = useState(false);
  const [selectedPG, setSelectedPG] = useState<SanityPG | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const filtered = initialPGs.filter((pg) => {
    const matchSearch =
      !search ||
      pg.name.toLowerCase().includes(search.toLowerCase()) ||
      pg.area.toLowerCase().includes(search.toLowerCase()) ||
      pg.city.toLowerCase().includes(search.toLowerCase());
    const matchGender =
      genderFilter === 'all' || pg.genderRestriction === genderFilter;
    return matchSearch && matchGender;
  });

  const handleInquire = (pg: SanityPG) => {
    setSelectedPG(pg);
    setInquiryDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPG) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pgId: selectedPG.dbId }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      toast.success("Inquiry submitted! We'll contact you soon.");
      setInquiryDialog(false);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect PG
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comfortable, affordable paying guest accommodations in the heart of
            the city
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, area, or city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {['all', 'BOYS', 'GIRLS', 'COED'].map((g) => (
            <Button
              key={g}
              variant={genderFilter === g ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGenderFilter(g)}
            >
              {g === 'all' ? 'All' : GENDER_LABELS[g]}
            </Button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-center text-gray-500 mb-6 text-sm">
          {filtered.length} accommodation{filtered.length === 1 ? '' : 's'} found
        </p>

        {/* PG Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BedDouble className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No accommodations found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filtered.map((pg) => {
              const thumb = pg.images?.[0];
              const imgUrl = thumb?.asset.url;
              return (
                <div
                  key={pg._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={thumb?.alt ?? pg.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <BedDouble className="h-16 w-16 text-blue-200" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className={GENDER_COLORS[pg.genderRestriction]}>
                        {GENDER_LABELS[pg.genderRestriction]}
                      </Badge>
                    </div>
                    {pg.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-500 text-white">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {pg.name}
                      </h3>
                      {pg.verificationStatus === 'VERIFIED' && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      {pg.area}, {pg.city}
                    </div>

                    {pg.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {pg.description}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-sm mb-4 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{pg.availableRooms} available</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Starting at</span>
                        <div className="font-bold text-blue-600 text-base">
                          ₹{pg.startingPrice.toLocaleString()}
                          <span className="text-xs text-gray-400 font-normal">
                            /mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleInquire(pg)}
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Inquire
                      </Button>
                      <Link href={`/pg/${pg.dbId}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          View Rooms
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialog} onOpenChange={setInquiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquire about {selectedPG?.name}</DialogTitle>
            <DialogDescription>
              We&apos;ll reach out within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="inq-name">Full Name *</Label>
              <Input
                id="inq-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="inq-email">Email</Label>
              <Input
                id="inq-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="optional"
              />
            </div>
            <div>
              <Label htmlFor="inq-msg">Message</Label>
              <Textarea
                id="inq-msg"
                rows={3}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
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
