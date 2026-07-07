/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // H-5: Added avif for modern browsers (smaller file sizes than webp).
    // deviceSizes covers common breakpoints for optimal responsive srcset generation.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
  },
}

module.exports = nextConfig