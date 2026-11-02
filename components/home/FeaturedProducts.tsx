'use client'

import React from 'react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import ProductCard from '../products/ProductCard'
import { products } from '../../lib/data'
import { useScrollReveal } from '../../lib/hooks'

export default function FeaturedProducts() {
  const { ref, visible } = useScrollReveal()
  const featuredProducts = products.filter(p => p.featured)

  /* ponytail: Highlights 4 lead powders. Add category filter pills when catalog expands past 50 SKUs. */
  return (
    <section className="py-16 sm:py-24 bg-transparent" aria-label="Featured food powders">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                    transition-opacity transition-transform duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* ── Section header: two-column editorial split ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <SectionHeading
            tag="Ingredient catalog"
            heading="Single-source powders, zero additives"
            sub="Each powder is processed from whole produce, batch-tested, and available from 1 kg trial packs to 25 kg commercial bags."
          />
          <div className="flex-shrink-0">
            <Button variant="outline" size="md" href="/products" className="rounded-lg whitespace-nowrap text-xs sm:text-sm">
              View all {products.length} powders
            </Button>
          </div>
        </div>

        {/* ── Symmetrical 4-column grid ── */}
        {featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className={`reveal ${visible ? 'is-visible' : ''} reveal-delay-${Math.min(i + 1, 4)} h-full`}
              >
                <ProductCard
                  product={p}
                  showDescription={false}
                  highlighted={false}
                  priority={i < 4}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
