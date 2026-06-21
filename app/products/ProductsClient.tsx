'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '../../components/products/ProductGrid'

export default function ProductsClient() {
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null)

  useEffect(() => {
    // Read hash from URL: '#product-tomato-powder' → 'tomato-powder'
    const hash = window.location.hash  // e.g. '#product-tomato-powder'
    if (hash.startsWith('#product-')) {
      const slug = hash.replace('#product-', '')
      setHighlightedSlug(slug)

      // Scroll to that element
      const el = document.getElementById(`product-${slug}`)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)  // small delay ensures DOM is ready
      }

      // Remove highlight after 2.5s
      setTimeout(() => setHighlightedSlug(null), 2500)
    }
  }, [])

  return (
    <div className="pt-16 bg-ni-bg min-h-screen">
      {/* Page hero — ~280px, not full viewport */}
      <div className="border-b border-ni-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">OUR POWDERS</p>
          <h1 className="font-heading text-display font-semibold text-ni-primary">12 single-ingredient powders</h1>
          <p className="font-body text-base text-ni-secondary mt-4 max-w-2xl leading-relaxed">
            Manufactured in Surendranagar. Available from 1kg samples to 25kg commercial bags.
            All batches tested for moisture, color, and mesh fineness.
          </p>
        </div>
      </div>

      {/* Product grid with filter */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <ProductGrid showFilter={true} showDescription={true} highlightedSlug={highlightedSlug} />
      </div>
    </div>
  )
}