'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ContactMethods } from '@/lib/sanity/queries/contactDetails';
import { Button } from '@/components/ui/button';
import { ContactOptionsDialog } from '@/components/ContactOptionsDialog';

interface RoomDetailActionButtonsProps {
  canCheckout: boolean;
  checkoutHref: string | null;
  contactDetails?: ContactMethods | null;
  roomTitle: string;
  pgSlug?: string;
}

export function RoomDetailActionButtons({
  canCheckout,
  checkoutHref,
  contactDetails,
  roomTitle,
  pgSlug,
}: Readonly<RoomDetailActionButtonsProps>) {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        {canCheckout && checkoutHref ? (
          <Button
            asChild
            size="lg"
            className="min-w-[160px] bg-black text-white hover:bg-black/90"
          >
            <Link href={checkoutHref}>Checkout</Link>
          </Button>
        ) : (
          <Button
            size="lg"
            disabled
            className="min-w-[160px] bg-gray-200 text-gray-500 hover:bg-gray-200"
          >
            Checkout Unavailable
          </Button>
        )}

        <Button
          size="lg"
          variant="outline"
          className="min-w-[160px] border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
          onClick={() => setContactDialogOpen(true)}
        >
          Inquire
        </Button>
      </div>

      <ContactOptionsDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contactDetails={contactDetails}
        title={`Contact for ${roomTitle}`}
        description="Use WhatsApp or call the owner directly for room inquiries."
      />
    </>
  );
}

