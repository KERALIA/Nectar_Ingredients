'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { useRouter } from 'next/navigation'

function CartBagIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="21" r="1" fill="currentColor"/>
      <circle cx="19" cy="21" r="1" fill="currentColor"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}

export default function SampleBasketBadge() {
  const { basket, totalItems, removeFromBasket, setItemQuantity } = useSampleBasket()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel on click/touch outside (handles both mouse and touch)
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e instanceof TouchEvent ? e.touches[0]?.target : e.target
      if (panelRef.current && !panelRef.current.contains(target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside)
      document.addEventListener('touchstart', handleOutside, { passive: true })
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  if (totalItems === 0) return null

  return (
    // KEY FIX: The outer wrapper only has pointer-events when the trigger button itself
    // is visible. When the panel is closed the wrapper is `pointer-events-none` which
    // means it CANNOT intercept touches on the page content beneath it.
    // The trigger button re-enables pointer-events on itself via `pointer-events-auto`.
    <div
      ref={panelRef}
      className={`fixed bottom-[90px] right-6 z-[60] flex flex-col items-end gap-2 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >

      {/* ── Expanded panel ───────────────────────────────────────────── */}
      <div
        className={`
          w-80 bg-white dark:bg-[#1A1A1D] text-ni-primary rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
        `}
        role="region"
        aria-label="Sample basket"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <p className="font-body text-[10px] font-bold tracking-widest uppercase text-ni-muted">
              Sample Basket
            </p>
            <p className="font-heading text-sm font-bold text-ni-primary mt-0.5">
              {totalItems} item{totalItems !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-ni-muted hover:text-ni-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-sm"
            aria-label="Close basket panel"
          >
            ✕
          </button>
        </div>

        {/* Items list */}
        <ul className="px-4 py-3 space-y-3 max-h-56 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          {basket.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 group">
              {/* Dot + name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-body text-xs font-semibold text-ni-primary truncate leading-snug">
                    {item.name}
                  </p>
                  <p className="font-mono text-[10px] text-ni-muted mt-0.5">
                    {item.sku}
                  </p>
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="w-5 h-5 flex items-center justify-center rounded text-ni-muted hover:text-ni-primary hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all text-xs font-bold leading-none"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setItemQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                  aria-label={`Quantity for ${item.name} in kg`}
                  className="w-8 text-center font-body text-xs text-ni-primary bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded py-0.5 outline-none focus:ring-1 focus:ring-ni-rust appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="w-5 h-5 flex items-center justify-center rounded text-ni-muted hover:text-ni-primary hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all text-xs font-bold leading-none"
                >
                  +
                </button>
                <span className="font-body text-[10px] text-ni-muted ml-0.5">kg</span>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromBasket(item.id)}
                className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold text-xs flex-shrink-0 cursor-pointer"
                aria-label={`Remove ${item.name} from basket`}
                title="Remove item"
              >
                <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="px-4 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => { setIsOpen(false); router.push('/contact') }}
            className="w-full bg-ni-rust text-white font-body text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2"
          >
            Proceed to Inquiry →
          </button>
          <p className="font-body text-[10px] text-ni-muted text-center mt-2">
            Quantities adjustable · Adjusted on first order
          </p>
        </div>
      </div>

      {/* ── Trigger button ────────────────────────────────────────────── */}
      {/* Always pointer-events-auto so the trigger is always tappable */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          pointer-events-auto
          flex items-center gap-2 px-4 py-2.5
          bg-white dark:bg-[#1A1A1D] rounded-full shadow-2xl border border-neutral-200 dark:border-neutral-800
          transition-all duration-200
          hover:scale-105 active:scale-95
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg
        `}
        aria-label={`Sample basket — ${totalItems} item${totalItems !== 1 ? 's' : ''}. Click to ${isOpen ? 'close' : 'view'}.`}
        aria-expanded={isOpen}
      >
        <span className="text-ni-rust"><CartBagIcon /></span>
        {/* Pill badge */}
        <span className="flex items-center gap-1.5">
          <span className="font-body text-xs font-bold text-ni-primary">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
          <span className="w-5 h-5 rounded-full bg-ni-rust text-white font-body text-[10px] font-bold flex items-center justify-center">
            {totalItems}
          </span>
        </span>
      </button>

    </div>
  )
}
