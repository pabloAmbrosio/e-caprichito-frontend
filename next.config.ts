import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Dev only: backend local que sirve assets estáticos.
      ...(process.env.NODE_ENV === 'development'
        ? [{ protocol: 'http' as const, hostname: 'localhost', port: '3000', pathname: '/**' }]
        : []),
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
