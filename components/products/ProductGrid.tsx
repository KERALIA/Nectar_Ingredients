'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { products } from '../../lib/data'
import { Product } from '../../types'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import ProductSearchBar from './ProductSearchBar'
import ProductDrawer from './ProductDrawer'
import { useSearch } from '../../context/SearchContext'
import { User } from '@supabase/supabase-js'

type Category = 'all' | 'vegetable' | 'fruit' | 'spice'
type SortMode = 'default' | 'alpha' | 'featured'

interface ProductGridProps {
  showDescription?: boolean
  showFilter?: boolean
  limit?: number
  highlightedSlug?: string | null
  prices?: Record<string, number>
  user?: User | null
}

export default function ProductGrid({
  showDescription = false,
  showFilter = false,
  limit,
  highlightedSlug = null,
  prices = {},
  user = null,
}: ProductGridProps) {
  const [active, setActive] = useState<Category>('all')
  const { searchTerm, setSearchTerm } = useSearch()
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Deep-link: open drawer only on mount if hash explicitly starts with #product-
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#product-')) {
      const slug = hash.replace('#product-', '')
      const matched = products.find((p) => p.slug === slug)
      if (matched) {
        setTimeout(() => {
          setDrawerProduct(matched)
          setIsDrawerOpen(true)
        }, 300)
      }
    }
  }, [])

  // Reset category filter if highlighted product is in a different category
  useEffect(() => {
    if (!highlightedSlug) return
    const matched = products.find(p => p.slug === highlightedSlug)
    if (matched && active !== 'all' && matched.category !== active) {
      setActive('all')
    }
  }, [highlightedSlug, active])

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
    <div>
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
            price={prices[p.sku]}
            user={user}
          />
        ))}
      </div>

      {/* Empty state with Smart 1-Click Discovery Pills */}
      {displayed.length === 0 && (
        <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl border border-ni-border/20 bg-ni-surface/60 dark:bg-white/[0.02] backdrop-blur-md shadow-sm">
          <span className="text-3xl mb-3 block" aria-hidden="true">🔍</span>
          <p className="font-heading text-lg font-bold text-ni-primary">No matching powders found</p>
          <p className="font-body text-xs text-ni-muted mt-1 leading-relaxed">
            We couldn't find anything matching &ldquo;{searchTerm}&rdquo;. Try browsing our top industrial ingredients:
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['Tomato', 'Onion', 'Garlic', 'Beetroot', 'Turmeric'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setSearchTerm(suggestion)
                  setActive('all')
                }}
                className="font-body text-xs font-bold px-3.5 py-1.5 rounded-full bg-ni-rust/10 hover:bg-ni-rust text-ni-rust hover:text-white border border-ni-rust/20 transition-all active:scale-95"
              >
                + {suggestion}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => { setSearchTerm(''); setActive('all') }}
            className="mt-6 font-body text-xs font-bold text-ni-muted hover:text-ni-primary transition-colors underline underline-offset-4 block mx-auto"
          >
            Clear all filters and search
          </button>
        </div>
      )}

      {/* Product Drawer */}
      <ProductDrawer
        product={drawerProduct}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        price={drawerProduct ? prices[drawerProduct.sku] : undefined}
        user={user}
      />
    </div>
  )
}
