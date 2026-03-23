export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 text-white relative">
        <div className="flex flex-col justify-center px-12 py-16">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              Welcome to
              <br />
              PG Connect! 👋
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              "Finding Home, Simplifying Lives"
              <br />
              <br />
              Our digital platform simplifies PG finding with fast approvals,
              flexible bookings, and transparent pricing. Whether you're
              searching for accommodation, managing properties, or connecting
              with tenants.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="absolute bottom-6 left-12">
          <p className="text-blue-100 text-sm">
            © Copyright 2024 · All rights Reserved
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

