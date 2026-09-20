'use client'

import React from 'react'
import { products } from '../../lib/data'

type Category = 'all' | 'vegetable' | 'fruit' | 'spice'

interface CategoryFilterProps {
  active: Category
  onChange: (c: Category) => void
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const counts = {
    all: products.length,
    vegetable: products.filter(p => p.category === 'vegetable').length,
    fruit: products.filter(p => p.category === 'fruit').length,
    spice: products.filter(p => p.category === 'spice').length,
  }

  const options: { label: string; value: Category; count: number }[] = [
    { label: 'All Powders', value: 'all', count: counts.all },
    { label: 'Vegetables', value: 'vegetable', count: counts.vegetable },
    { label: 'Fruits', value: 'fruit', count: counts.fruit },
    { label: 'Spices & Herbs', value: 'spice', count: counts.spice },
  ]

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 mb-8 p-1.5 rounded-2xl bg-ni-surface2/30 dark:bg-white/[0.03] border border-ni-border/20 dark:border-white/5 w-full sm:w-fit overflow-x-auto scrollbar-hide overscroll-contain">
      {options.map((opt) => {
        const isActive = active === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-shrink-0 flex items-center gap-2 font-body text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust cursor-pointer active:scale-[0.97] ${
              isActive
                ? 'bg-ni-rust text-white shadow-card scale-[1.02]'
                : 'text-ni-secondary hover:text-ni-primary hover:bg-ni-surface2/60 dark:hover:bg-white/10'
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-ni-surface2 text-ni-muted'
              }`}
            >
              {opt.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}