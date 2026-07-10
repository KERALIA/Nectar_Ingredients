'use client'

import React from 'react'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { useRouter } from 'next/navigation'

function CartBagIcon() {
  return (
    <svg className="w-6 h-6 text-ni-rust" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1" fill="currentColor"/>
      <circle cx="19" cy="21" r="1" fill="currentColor"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      <path d="M9 6l1.5-1.5L12 6l1.5-1.5L15 6V11H9V6z" fill="currentColor" opacity="0.2"/>
      <path d="M9 6v5h6V6M9 6l1.5-1.5L12 6l1.5-1.5L15 6" strokeWidth="1.5"/>
    </svg>
  )
}

// H-3: SampleBasketBadge now uses the ni-* Tailwind design tokens exclusively
// instead of mixing bg-neutral-900, bg-[var(--surface)]/60, and border-neutral-800.
// This makes it correctly follow the dark/light theme system.
export default function SampleBasketBadge() {
  const { basket, totalItems } = useSampleBasket()
  const router = useRouter()

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        onClick={() => router.push('/contact')}
        className="group flex items-center justify-center gap-1.5 w-12 h-12 p-0
          glass-panel rounded-full
          bg-[var(--surface-glass)]
          shadow-premium
          transition-all duration-200
          hover:scale-105 active:scale-95
          hover:bg-ni-surface2
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg"
        aria-label={`Samples bag with ${totalItems} item${totalItems !== 1 ? 's' : ''} — click to proceed to contact`}
      >
        <CartBagIcon />
        <span className="font-body text-xs font-semibold text-ni-rust leading-none">{totalItems}</span>

        {/* Hover tooltip — items list */}
        <div className="absolute bottom-full right-0 mb-2 w-64
          glass-panel shadow-premium rounded-2xl
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none">
          <div className="px-4 py-3">
            <p className="font-body text-[10px] font-bold text-ni-muted uppercase tracking-widest mb-2">
              Items in bag
            </p>
            <ul className="space-y-1">
              {basket.map((item) => (
                <li key={item.id} className="font-body text-sm text-ni-secondary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ni-rust flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </button>
    </div>
  )
}
