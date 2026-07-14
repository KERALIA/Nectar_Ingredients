import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/pay'],
    },
    sitemap: 'https://nectaringredients.vercel.app/sitemap.xml',
  }
}
