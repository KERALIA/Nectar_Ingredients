import { Suspense } from 'react'
import ProductsClient from './ProductsClient'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Our Dehydrated Powders',
  description: 'Browse the full range of 24 pure single-ingredient dehydrated food powders manufactured by Nectaringredients. Built for commercial food brands and kitchens.',
  alternates: {
    canonical: '/products',
  },
}

export default async function ProductsPage() {
  let prices: Record<string, number> = {}
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('product_prices').select('sku, base_price')
    if (data) {
      prices = data.reduce((acc, curr) => {
        acc[curr.sku] = Number(curr.base_price)
        return acc
      }, {} as Record<string, number>)
    }
  } catch (error) {
    console.error('Error fetching prices from Supabase:', error)
  }

  return (
    <Suspense fallback={<div className="pt-32 text-center text-ni-muted">Loading powders...</div>}>
      <ProductsClient initialPrices={prices} />
    </Suspense>
  )
}
