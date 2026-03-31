import Login from '@/components/auth/Login';

type LoginPageProps = {
  searchParams?: {
    next?: string | string[];
    error?: string | string[];
  };
};

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default function LoginPage({ searchParams }: Readonly<LoginPageProps>) {
  return (
    <Login
      nextPath={getSingleSearchParam(searchParams?.next)}
      oauthError={getSingleSearchParam(searchParams?.error)}
    />
  );
}

