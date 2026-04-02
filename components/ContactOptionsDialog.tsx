'use client';

import { ExternalLink, Mail, MessageCircle, Phone } from 'lucide-react';
import type { ContactMethods } from '@/lib/sanity/queries/contactDetails';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContactOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactDetails?: ContactMethods | null;
  title: string;
  description?: string;
}

interface ContactAction {
  key: string;
  label: string;
  value: string;
  href: string | null;
  icon: typeof MessageCircle;
  buttonLabel: string;
  buttonClassName: string;
  buttonVariant?: 'default' | 'outline';
}

function normalizePhoneNumber(phoneNumber?: string | null) {
  if (!phoneNumber) {
    return null;
  }

  const digitsOnly = Array.from(phoneNumber)
    .filter((character) => character >= '0' && character <= '9')
    .join('');
  return digitsOnly || null;
}

function normalizeCallHref(phoneNumber?: string | null) {
  if (!phoneNumber) {
    return null;
  }

  const compactPhoneNumber = phoneNumber.trim().split(/\s+/).join('');
  return compactPhoneNumber ? `tel:${compactPhoneNumber}` : null;
}

export function ContactOptionsDialog({
  open,
  onOpenChange,
  contactDetails,
  title,
  description,
}: Readonly<ContactOptionsDialogProps>) {
  const whatsappNumber = contactDetails?.whatsappNumber ?? null;
  const phoneNumber = contactDetails?.phoneNumber ?? null;
  const email = contactDetails?.email ?? null;

  const normalizedWhatsappNumber = normalizePhoneNumber(whatsappNumber);
  const whatsappHref = normalizedWhatsappNumber
    ? `https://wa.me/${normalizedWhatsappNumber}`
    : null;
  const callHref = normalizeCallHref(phoneNumber);
  const emailHref = email ? `mailto:${email}` : null;
  const actions: ContactAction[] = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      value: whatsappNumber ?? 'Not available',
      href: whatsappHref,
      icon: MessageCircle,
      buttonLabel: 'Open WhatsApp',
      buttonClassName:
        'bg-green-500 text-white hover:bg-green-600 border-green-500',
    },
    {
      key: 'phone',
      label: 'Mobile Number',
      value: phoneNumber ?? 'Not available',
      href: callHref,
      icon: Phone,
      buttonLabel: 'Call Now',
      buttonClassName:
        'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
      buttonVariant: 'outline',
    },
    {
      key: 'email',
      label: 'Email',
      value: email ?? 'Not available',
      href: emailHref,
      icon: Mail,
      buttonLabel: 'Email Now',
      buttonClassName:
        'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
      buttonVariant: 'outline',
    },
  ];
  const availableActions = actions.filter((action) => Boolean(action.href));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border border-gray-200 bg-white p-0 sm:max-w-xl">
        <DialogHeader>
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
            <DialogTitle className="text-2xl font-semibold text-gray-950">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-600">
              {description ??
                'Choose how you want to contact the property owner.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {availableActions.length > 0 ? (
            <div className="grid gap-3">
              {actions.map((action) => {
                const ActionIcon = action.icon;

                return (
                  <div
                    key={action.key}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                        <ActionIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-500">
                          {action.label}
                        </p>
                        <p className="mt-1 break-words text-base font-semibold text-gray-900">
                          {action.value}
                        </p>
                      </div>
                    </div>

                    {action.href ? (
                      <Button
                        asChild
                        variant={action.buttonVariant ?? 'default'}
                        className={`w-full sm:w-auto ${action.buttonClassName}`}
                      >
                        <a
                          href={action.href}
                          target={
                            action.key === 'whatsapp' ? '_blank' : undefined
                          }
                          rel={
                            action.key === 'whatsapp' ? 'noreferrer' : undefined
                          }
                        >
                          <ActionIcon className="mr-2 h-4 w-4" />
                          {action.buttonLabel}
                          {action.key === 'whatsapp' ? (
                            <ExternalLink className="ml-2 h-4 w-4" />
                          ) : null}
                        </a>
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-400">Not available</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Contact details are not available right now.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

