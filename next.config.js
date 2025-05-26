import nextPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudinaryLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

const isProd = process.env.NODE_ENV === 'production';

const config = isProd
  ? nextPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
    })(nextConfig)
  : nextConfig;

export default config;
