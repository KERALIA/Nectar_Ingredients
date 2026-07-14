import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import SampleBasketProvider from '../context/SampleBasketContext'
import SearchProvider from '../context/SearchContext'
import SampleBasketBadge from '../components/ui/SampleBasketBadge'
import ChatWidget from '../components/ChatWidget'

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
  title: {
    default: 'Nectar Ingredients — Pure Dehydrated Food Powders',
    template: '%s — Nectar Ingredients',
  },
  description:
    'Manufacturer of single-ingredient dehydrated vegetable, fruit, and spice powders for food businesses and home kitchens. Based in Surendranagar, Gujarat. Est. 2011.',
  keywords: [
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
  metadataBase: new URL('https://nectaringredients.com'),
  openGraph: {
    title: 'Nectar Ingredients — Pure Dehydrated Food Powders',
    description:
      'Single-ingredient dehydrated powders. No fillers, no additives. Direct from our facility in Surendranagar, Gujarat.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nectar Ingredients',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nectar Ingredients — Pure Dehydrated Food Powders',
    description: 'Single-ingredient dehydrated powders. No fillers, no additives.',
  },
  robots: {
    index: true,
    follow: true,
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline theme-flash prevention script — must run synchronously before paint */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('ni-theme');
                document.documentElement.setAttribute('data-theme', t || 'dark');
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${inter.variable} font-body bg-ni-bg text-ni-primary antialiased`}
      >
        <ThemeProvider>
          <SearchProvider>
            <SampleBasketProvider>
              <Navbar />
              <main aria-label="Main content">{children}</main>
              <Footer />
              <SampleBasketBadge />
            </SampleBasketProvider>
          </SearchProvider>
        </ThemeProvider>
        <ChatWidget />
      </body>
    </html>
  )
}