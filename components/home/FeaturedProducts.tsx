'use client'

import React, { useRef, useState, useEffect } from 'react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import ProductCard from '../products/ProductCard'
import { products } from '../../lib/data'

export default function FeaturedProducts() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

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
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} showDescription={false} highlighted={false} />
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" size="md" href="/products">View all 12 powders →</Button>
        </div>
      </div>
    </section>
  )
}