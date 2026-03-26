/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      'cdn.sanity.io', // Sanity images
      'lh3.googleusercontent.com', // Firebase auth images
    ],
  },

  eslint: {
    ignoreDuringBuilds: true, // prevents build fail due to lint
  },

  typescript: {
    ignoreBuildErrors: true, // optional (remove in strict prod)
  },

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Temporary fix for serialization issues during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Output standalone for better deployment
  output: 'standalone',
  redirects: () => {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

