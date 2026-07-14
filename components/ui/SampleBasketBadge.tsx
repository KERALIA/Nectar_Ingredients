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

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  if (totalItems === 0) return null

  return (
    <div ref={panelRef} className="fixed bottom-[90px] right-6 z-[60] flex flex-col items-end gap-2">

      {/* ── Expanded panel ───────────────────────────────────────────── */}
      <div
        className={`
          w-80 glass-panel rounded-2xl shadow-premium border border-ni-border/20
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
        `}
        role="region"
        aria-label="Sample basket"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-ni-border/15">
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
            className="w-7 h-7 flex items-center justify-center rounded-full text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-all text-sm"
            aria-label="Close basket panel"
          >
            ✕
          </button>
        </div>

        {/* Items list */}
        <ul className="px-4 py-3 space-y-3 max-h-56 overflow-y-auto">
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
                  className="w-5 h-5 flex items-center justify-center rounded text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-all text-xs font-bold leading-none"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setItemQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                  aria-label={`Quantity for ${item.name} in kg`}
                  className="w-8 text-center font-body text-xs text-ni-primary bg-ni-surface2 border border-ni-border/30 rounded py-0.5 outline-none focus:ring-1 focus:ring-ni-rust appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="w-5 h-5 flex items-center justify-center rounded text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-all text-xs font-bold leading-none"
                >
                  +
                </button>
                <span className="font-body text-[10px] text-ni-muted ml-0.5">kg</span>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromBasket(item.id)}
                className="font-body text-[10px] text-ni-muted hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${item.name} from basket`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="px-4 pb-4 pt-2 border-t border-ni-border/15">
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
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex items-center gap-2 px-4 py-2.5
          glass-panel rounded-full shadow-premium
          transition-all duration-200
          hover:scale-105 active:scale-95
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg
          ${isOpen ? 'bg-ni-surface2' : 'bg-[var(--surface-glass)]'}
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
