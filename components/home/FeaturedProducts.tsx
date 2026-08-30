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

  return (
    <section className="py-[var(--space-section)] bg-transparent">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                    transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* ── Section header: two-column editorial split ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <SectionHeading
            tag="PRODUCTS"
            heading="Pure ingredients, nothing added"
            sub="Each powder is single-source, batch-tested, and available from 1 kg samples to 25 kg commercial bags."
          />
          <div className="flex-shrink-0">
            <Button variant="outline" size="md" href="/products" className="rounded-full whitespace-nowrap">
              View all {products.length} powders →
            </Button>
          </div>
        </div>

        {/* ── Symmetrical 4-column grid ── */}
        {featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className="h-full"
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
