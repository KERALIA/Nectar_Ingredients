import { Suspense } from 'react'
import ProductsClient from './ProductsClient'
import { products } from '../../lib/data'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Bulk Food Ingredients Supplier | Nectar Ingredients',
  description: 'Wholesale B2B distributor of premium industrial food ingredients. Sourcing bulk Tomato Powder, onion powder, and over 40 raw ingredients with worldwide shipping.',
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: 'Bulk Food Ingredients Catalog | Nectar Ingredients',
    description: 'Direct wholesale industrial supply for 40+ raw ingredients. View our full commercial product specifications, certifications, and volume pricing requests.',
    url: `${SITE_URL}/products`,
    siteName: 'Nectar Ingredients',
    images: [
      {
        url: `${SITE_URL}/og-products-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Nectar Ingredients Wholesale Product B2B Directory Catalog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk Industrial Food Ingredients Supplier | Nectar Ingredients',
    description: 'Wholesale distributor sourcing bulk Tomato Powder and 40 raw ingredients for commercial manufacturing.',
    images: [`${SITE_URL}/og-products-image.jpg`],
  },
}

function ProductsSkeleton() {
  return (
    <div className="pt-32 min-h-screen bg-ni-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="h-4 w-24 bg-ni-border/40 rounded-full mb-6 animate-pulse" />
        <div className="h-12 w-80 bg-ni-border/40 rounded-lg mb-4 animate-pulse" />
        <div className="h-4 w-64 bg-ni-border/30 rounded mb-10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-[var(--radius-lg)] bg-ni-border/20 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function ProductsPage() {
  let initialPrices: Record<string, number> = {}
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
      const { data } = await supabase.from('product_prices').select('sku, base_price')
      if (data) {
        data.forEach((row: { sku: string; base_price: number }) => {
          if (row.sku && typeof row.base_price === 'number') {
            initialPrices[row.sku] = row.base_price
          }
        })
      }
    } catch (err) {
      console.error('Failed to fetch initial prices for SSR:', err)
    }
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Nectar Ingredients Pure Dehydrated Food Powders Catalog',
    'description': 'Complete commercial directory of 40 single-ingredient dehydrated vegetable, fruit, and spice powders.',
    'numberOfItems': products.length,
    'itemListElement': products.map((p, index) => {
      const livePrice = initialPrices[p.sku]
      const priceVal = livePrice && livePrice > 0 ? String(livePrice) : '100.00'

      return {
        '@type': 'ListItem',
        'position': index + 1,
        'name': `Bulk ${p.name} Supplier & Wholesale Distributor`,
        'url': `${SITE_URL}/products#${p.slug}`,
        'item': {
          '@type': 'Product',
          'name': `Bulk ${p.name} Supplier & Wholesale Distributor`,
          'sku': p.sku,
          'image': `${SITE_URL}${p.imageSrc}`,
          'description': `Nectar Ingredients is a premier industrial food ingredients ${p.name.toLowerCase()} distributor, offering wholesale commercial pricing for manufacturing scales.`,
          'brand': {
            '@type': 'Brand',
            'name': 'Nectar Ingredients',
          },
          'manufacturer': {
            '@type': 'Organization',
            'name': 'Nectar Ingredients Pvt. Ltd.',
          },
          'offers': {
            '@type': 'Offer',
            'price': priceVal,
            'priceCurrency': 'INR',
            'priceValidUntil': '2027-12-31',
            'availability': 'https://schema.org/InStock',
            'url': `${SITE_URL}/products#${p.slug}`,
            'seller': {
              '@type': 'Organization',
              'name': 'Nectar Ingredients',
            },
          },
        },
      }
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsClient initialPrices={initialPrices} />
      </Suspense>
    </>
  )
}



