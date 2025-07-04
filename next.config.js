import nextPWA from 'next-pwa'
import runtimeCaching from 'next-pwa/cache.js'

const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const baseConfig = {
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
}

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    document: '/offline.html',
    image: "/cloud-solid.svg"
  },
}

export default isProd
  ? nextPWA(pwaConfig)(baseConfig)
  : baseConfig
