import { Suspense } from 'react'
import ProductsClient from './ProductsClient'

export const metadata = {
  title: 'Our Dehydrated Powders',
  description: 'Browse the full range of 24 pure single-ingredient dehydrated food powders manufactured by Nectaringredients. Built for commercial food brands and kitchens.',
  alternates: {
    canonical: '/products',
  },
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-ni-muted">Loading powders...</div>}>
      <ProductsClient />
    </Suspense>
  )
}