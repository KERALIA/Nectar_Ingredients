'use client'

import React, { useState } from 'react'
import { products } from '../../lib/data'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'

type Category = 'all' | 'vegetable' | 'fruit' | 'spice'

interface ProductGridProps {
  showDescription?: boolean
  showFilter?: boolean
  limit?: number
  highlightedSlug?: string | null
}

export default function ProductGrid({ showDescription = false, showFilter = false, limit, highlightedSlug = null }: ProductGridProps) {
  const [active, setActive] = useState<Category>('all')

  const filtered = active === 'all'
    ? products
    : products.filter(p => p.category === active)

  const displayed = limit ? filtered.slice(0, limit) : filtered

  return (
    <div>
      {showFilter && <CategoryFilter active={active} onChange={setActive} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-ni-border">
        {displayed.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            showDescription={showDescription}
            highlighted={highlightedSlug === p.slug}
          />
        ))}
      </div>
    </div>
  )
}