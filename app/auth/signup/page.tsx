import Signup from '@/components/auth/Signup';

type SignupPageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function SignupPage({
  searchParams,
}: Readonly<SignupPageProps>) {
  return <Signup nextPath={getSingleSearchParam(searchParams?.next)} />;
}

