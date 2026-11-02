/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable gzip/brotli compression for served assets
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Exclude native Node packages from serverless bundling on Vercel
  serverExternalPackages: ['pdfkit'],

  images: {
    // Serve modern formats — avif ~50% smaller than webp, webp as fallback
    formats: ['image/avif', 'image/webp'],
    // Cover all common device breakpoints including tablet and desktop
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    // Aggressively cache optimized images for 1 year (31536000s)
    minimumCacheTTL: 31536000,
  },

  // Optimized Vercel Edge security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
