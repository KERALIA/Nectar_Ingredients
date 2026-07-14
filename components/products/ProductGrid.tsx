'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { products } from '../../lib/data'
import { Product } from '../../types'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import ProductSearchBar from './ProductSearchBar'
import ProductDrawer from './ProductDrawer'
import { useSearch } from '../../context/SearchContext'

type Category = 'all' | 'vegetable' | 'fruit' | 'spice'
type SortMode = 'default' | 'alpha' | 'featured'

interface ProductGridProps {
  showDescription?: boolean
  showFilter?: boolean
  limit?: number
  highlightedSlug?: string | null
}

export default function ProductGrid({ showDescription = false, showFilter = false, limit, highlightedSlug = null }: ProductGridProps) {
  const [active, setActive] = useState<Category>('all')
  const { searchTerm, setSearchTerm } = useSearch()
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Deep-link: open drawer on mount if URL hash matches #product-{slug}
  useEffect(() => {
    const hash = window.location.hash  // e.g. '#product-tomato-powder'
    if (hash.startsWith('#product-')) {
      const slug = hash.replace('#product-', '')
      const matched = products.find(p => p.slug === slug)
      if (matched) {
        // Small delay so the page layout settles before drawer slides in
        setTimeout(() => {
          setDrawerProduct(matched)
          setIsDrawerOpen(true)
        }, 300)
      }
    }
  }, [])

  // H-6 Fix: Memoize categoryFiltered so it only recomputes when `active` changes,
  // not on every state update (e.g. isDrawerOpen toggling).
  const categoryFiltered = useMemo(
    () => active === 'all' ? products : products.filter(p => p.category === active),
    [active]
  )

  // Filter by search term
  const searched = useMemo(() => {
    if (!searchTerm.trim()) return categoryFiltered
    const term = searchTerm.toLowerCase()
    return categoryFiltered.filter(p => {
      const fields = [
        p.name,
        p.tagline,
        p.description,
        p.sku,
        ...(p.usageApplications || []),
      ]
      return fields.some(f => f.toLowerCase().includes(term))
    })
  }, [searchTerm, categoryFiltered])

  // Sort
  const sorted = useMemo(() => {
    const arr = [...searched]
    switch (sortMode) {
      case 'alpha':
        return arr.sort((a, b) => a.name.localeCompare(b.name))
      case 'featured':
        return arr.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1))
      default:
        return arr
    }
  }, [searched, sortMode])

  const displayed = limit ? sorted.slice(0, limit) : sorted

  const handleOpenDrawer = (product: Product) => {
    setDrawerProduct(product)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setDrawerProduct(null), 300)
  }

  return (
    <div className="overflow-x-hidden">
      {/* Search + Sort */}
      <ProductSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortMode={sortMode}
        onSortChange={setSortMode}
        totalResults={displayed.length}
      />

      {showFilter && <CategoryFilter active={active} onChange={setActive} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 xl:gap-10">
        {displayed.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            showDescription={showDescription}
            highlighted={highlightedSlug === p.slug}
            onOpenDrawer={handleOpenDrawer}
          />
        ))}
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-body text-base text-ni-muted">No products match your search.</p>
          <button
            onClick={() => { setSearchTerm(''); setActive('all') }}
            className="mt-3 font-body text-sm text-ni-rust hover:text-ni-rust-lt transition-colors"
          >
            Clear filters →
          </button>
        </div>
      )}

      {/* Product Drawer */}
      <ProductDrawer
        product={drawerProduct}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
