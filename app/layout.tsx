import type { Metadata, Viewport } from 'next'
import { Sora, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import SampleBasketProvider from '../context/SampleBasketContext'
import SampleBasketBadge from '../components/ui/SampleBasketBadge'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nectar Ingredients — Pure Dehydrated Food Powders',
  description: 'Manufacturer of single-ingredient dehydrated vegetable, fruit, and spice powders for food businesses and home kitchens. Based in Surendranagar, Gujarat.',
}

// H-10 Fix: Explicit viewport export ensures device-width meta is correctly
// injected even with our custom <head> script for theme flash prevention.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('ni-theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body suppressHydrationWarning className={`${sora.variable} ${inter.variable} font-body bg-ni-bg text-ni-primary antialiased`}>
        <ThemeProvider>
          <SampleBasketProvider>
            <Navbar />
            <main aria-label="Main content">{children}</main>
            <Footer />
            <SampleBasketBadge />
          </SampleBasketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}