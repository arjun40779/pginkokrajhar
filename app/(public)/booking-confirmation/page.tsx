import BookingConfirmationPageClient from './BookingConfirmationPageClient';

type BookingConfirmationPageProps = {
  searchParams?: {
    bookingId?: string | string[];
  };
};

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function BookingConfirmationPage({
  searchParams,
}: Readonly<BookingConfirmationPageProps>) {
  return (
    <BookingConfirmationPageClient
      bookingId={getSingleSearchParam(searchParams?.bookingId)}
    />
  );
}

