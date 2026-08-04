import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import SampleBasketProvider from '../context/SampleBasketContext'
import SearchProvider from '../context/SearchContext'
import { CartProvider } from '../context/CartContext'
import CartDrawer from '../components/cart/CartDrawer'
import SampleBasketBadge from '../components/ui/SampleBasketBadge'
import ChatWidget from '../components/ChatWidget'
import Preloader from '../components/ui/Preloader'
import SmoothScrollProvider from '../components/providers/SmoothScrollProvider'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nectaringredients.vercel.app'),
  title: {
    default: 'Nectar Ingredients | Premium Food Ingredients Supplier',
    template: '%s',
  },
  description: 'Leading B2B manufacturer and bulk supplier of pure dehydrated vegetable, fruit, and spice powders in Surendranagar, Gujarat.',
  alternates: {
    canonical: 'https://nectaringredients.vercel.app/',
  },
  verification: {
    google: 'dqGk0aQeb5quQT8plRGRSkTttYmBadNp-urZcXYNh0I',
  },
  keywords: [
    'Nectaringredients',
    'nectaringredient',
    'dehydrated powder',
    'vegetable powder',
    'fruit powder',
    'spice powder',
    'food ingredients',
    'bulk ingredients',
    'Gujarat manufacturer',
    'clean label',
    'tomato powder',
    'turmeric powder',
  ],
  authors: [{ name: 'Nectar Ingredients Pvt. Ltd.' }],
  creator: 'Nectar Ingredients Pvt. Ltd.',
  openGraph: {
    title: 'Nectar Ingredients | Premium Food Ingredients Supplier',
    description: 'Leading B2B manufacturer and bulk supplier of pure dehydrated vegetable, fruit, and spice powders in Surendranagar, Gujarat.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nectar Ingredients',
    url: 'https://nectaringredients.vercel.app/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nectar Ingredients | Premium Food Ingredients Supplier',
    description: 'Leading B2B manufacturer and bulk supplier of pure dehydrated vegetable, fruit, and spice powders in Surendranagar, Gujarat.',
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    title: 'Nectar Ingredients',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Do NOT lock maximumScale — locks out accessibility zoom on iOS
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#1A1A1A' },
    { media: '(prefers-color-scheme: light)', color: '#FDFCF8' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Nectaringredients',
    'url': 'https://nectaringredients.vercel.app',
    'logo': 'https://nectaringredients.vercel.app/logo.png',
    'sameAs': [],
  }

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="apple-mobile-web-app-title" content="Nectar Ingredients" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Inline theme-flash prevention script — must run synchronously before paint */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('ni-theme');
                if (t === 'dark' || t === 'light') {
                  document.documentElement.setAttribute('data-theme', t);
                } else {
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${inter.variable} font-body bg-ni-bg text-ni-primary antialiased`}
      >
        <Preloader />
        <SmoothScrollProvider>
          <ThemeProvider>
            <SearchProvider>
              <CartProvider>
                <SampleBasketProvider>
                  <Navbar />
                  <main aria-label="Main content">{children}</main>
                  <Footer />
                  <SampleBasketBadge />
                </SampleBasketProvider>
              </CartProvider>
            </SearchProvider>
          </ThemeProvider>
          <ChatWidget />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}