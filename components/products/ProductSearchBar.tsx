'use client'

import React from 'react'

interface ProductSearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortMode: 'default' | 'alpha' | 'featured'
  onSortChange: (mode: 'default' | 'alpha' | 'featured') => void
  totalResults: number
}

export default function ProductSearchBar({
  searchTerm,
  onSearchChange,
  sortMode,
  onSortChange,
  totalResults,
}: ProductSearchBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-10">
      {/* Row 1: Search + Result count */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ni-muted text-sm pointer-events-none"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, tagline, or application..."
            className="w-full bg-ni-surface border border-ni-border pl-10 pr-4 py-3 font-body text-sm text-ni-primary placeholder:text-ni-muted outline-none focus:border-ni-rust transition-colors duration-200"
            aria-label="Search products"
          />
        </div>

        {/* Result count — always visible */}
        <div className="flex-shrink-0 font-body text-xs text-ni-muted whitespace-nowrap">
          {totalResults} product{totalResults !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Row 2: Sort controls — flex-wrap so they never overflow on small screens */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sort products">
        {(([
          { value: 'default', label: 'Default' },
          { value: 'alpha', label: 'A–Z' },
          { value: 'featured', label: 'Featured ↑' },
        ] as const)).map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            aria-pressed={sortMode === opt.value}
            className={`font-body text-xs font-medium tracking-wide uppercase px-4 py-2.5 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
              sortMode === opt.value
                ? 'border-ni-rust bg-ni-rust text-white'
                : 'border-ni-border2 text-ni-muted hover:border-ni-rust hover:text-ni-rust'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
