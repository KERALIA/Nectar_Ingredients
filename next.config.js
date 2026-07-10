/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable gzip/brotli compression for served assets
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  images: {
    // Serve modern formats — avif ~50% smaller than webp, webp as fallback
    formats: ['image/avif', 'image/webp'],
    // Cover all common device breakpoints including tablet and desktop
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    // Aggressively cache optimized images for 1 year (31536000s)
    minimumCacheTTL: 31536000,
  },
}

module.exports = nextConfig