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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-xl">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ni-muted pointer-events-none"
          aria-hidden="true"
        >
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, category, or application (e.g. Onion, Bakery, Soups)..."
          className="w-full bg-ni-surface/80 dark:bg-[#1A1A1D]/80 border border-ni-border/30 dark:border-white/10 pl-11 pr-10 py-3 font-body text-xs sm:text-sm text-ni-primary placeholder:text-ni-muted outline-none focus:border-ni-rust focus:ring-1 focus:ring-ni-rust transition-all duration-300 rounded-2xl shadow-sm backdrop-blur-md"
          aria-label="Search products"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ni-muted hover:text-ni-primary text-xs w-6 h-6 rounded-full bg-ni-surface2 flex items-center justify-center transition-colors"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sort Buttons & Total Results Badge */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-ni-surface2/30 dark:bg-white/[0.03] border border-ni-border/20 dark:border-white/5">
          {([
            { value: 'default', label: 'Default' },
            { value: 'alpha', label: 'A–Z' },
            { value: 'featured', label: 'Featured' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              aria-pressed={sortMode === opt.value}
              className={`font-body text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
                sortMode === opt.value
                  ? 'bg-ni-surface dark:bg-white/10 text-ni-primary shadow-sm border border-ni-border/30 dark:border-white/10'
                  : 'text-ni-muted hover:text-ni-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-xs font-bold text-ni-muted bg-ni-surface2/60 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-ni-border/10 whitespace-nowrap">
          {totalResults} {totalResults === 1 ? 'Powder' : 'Powders'}
        </span>
      </div>
    </div>
  )
}
