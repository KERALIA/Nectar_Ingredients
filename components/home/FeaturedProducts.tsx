'use client'

import React from 'react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import ProductCard from '../products/ProductCard'
import { products } from '../../lib/data'
import { useScrollReveal } from '../../lib/hooks'

export default function FeaturedProducts() {
  // H-1: useScrollReveal replaces the copy-pasted IntersectionObserver pattern
  const { ref, visible } = useScrollReveal()

  const featuredProducts = products.filter(p => p.featured)

  return (
    <section className="py-24">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <SectionHeading
          tag="PRODUCTS"
          heading="Pure ingredients, nothing added"
          sub="Each powder is single-source, batch-tested, and available from 1kg samples to 25kg commercial bags."
        />

        <div className="mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ni-border">
            {/* C-6: Dynamic count + O-2: priority for above-fold images */}
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} showDescription={false} highlighted={false} priority={i < 4} />
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          {/* C-6: Dynamic product count instead of hardcoded "12" */}
          <Button variant="outline" size="md" href="/products">View all {products.length} powders →</Button>
        </div>
      </div>
    </section>
  )
}