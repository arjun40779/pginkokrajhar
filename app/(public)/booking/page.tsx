import BookingPageClient from './BookingPageClient';

type BookingPageProps = {
  searchParams?: {
    pgId?: string | string[];
    roomId?: string | string[];
  };
};

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function BookingPage({
  searchParams,
}: Readonly<BookingPageProps>) {
  return (
    <BookingPageClient
      initialPgId={getSingleSearchParam(searchParams?.pgId)}
      initialRoomId={getSingleSearchParam(searchParams?.roomId)}
    />
  );
}

