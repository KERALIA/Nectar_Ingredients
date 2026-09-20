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

const POPULAR_RECOMMENDATIONS = [
  { id: '1', slug: 'tomato-powder', name: 'Tomato Powder', sku: 'NI-TOM-001', category: 'vegetable' },
  { id: '2', slug: 'onion-powder', name: 'Onion Powder', sku: 'NI-ONI-002', category: 'vegetable' },
  { id: '3', slug: 'garlic-powder', name: 'Garlic Powder', sku: 'NI-GAR-003', category: 'vegetable' },
  { id: '12', slug: 'spray-dried-watermelon-powder', name: 'Watermelon Powder', sku: 'NI-WAT-006', category: 'fruit' },
]

export default function SampleBasketBadge() {
  const { basket, totalItems, removeFromBasket, setItemQuantity, addToBasket } = useSampleBasket()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // External event listeners for coordination with Navbar, ChatWidget and SampleBoxBanner
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      if (totalItems === 0) {
        setShowToast(true)
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 4500)
      }
    }
    const handleClose = () => setIsOpen(false)
    window.addEventListener('open-sample-basket', handleOpen)
    window.addEventListener('close-sample-basket', handleClose)
    return () => {
      window.removeEventListener('open-sample-basket', handleOpen)
      window.removeEventListener('close-sample-basket', handleClose)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [totalItems])

  // When sample basket opens, notify chat widget to close
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-nectar-chat'))
    }
  }, [isOpen])

  const handleEmptyCartAction = () => {
    setIsOpen(false)
    setShowToast(false)
    router.push('/products')
  }

  return (
    <>
      {/* ── Top Floating Warning Toast (when opened while empty) ───────── */}
      {showToast && totalItems === 0 && (
        <div
          role="alert"
          className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md animate-slide-down pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-amber-900/95 dark:bg-[#201812]/95 text-amber-100 border border-amber-500/50 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <p className="font-heading text-xs uppercase tracking-wider font-extrabold text-amber-400">Notice</p>
                <p className="font-body text-xs sm:text-sm font-semibold text-white leading-snug">
                  Your cart is empty! Select powders from the catalog to get started.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-amber-300 hover:text-white text-lg font-bold p-1 cursor-pointer flex-shrink-0"
              aria-label="Dismiss warning"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Outer Drawer & Trigger Wrapper ─────────────────────────────── */}
      <div
        ref={panelRef}
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
        className={`fixed bottom-[85px] sm:bottom-[90px] right-3 sm:right-6 z-[60] flex flex-col items-end gap-2 ${
          isOpen || totalItems > 0 ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* ── Expanded panel ───────────────────────────────────────────── */}
        <div
          className={`
            w-[calc(100vw-1.5rem)] sm:w-92 max-w-sm bg-white dark:bg-[#1A1A1D] text-ni-primary rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800
            transition-all duration-300 origin-bottom-right overflow-hidden max-h-[85vh] flex flex-col
            ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
          `}
          role="region"
          aria-label="Cart"
          aria-hidden={!isOpen}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <div>
              <p className="font-body text-xs font-extrabold tracking-wider uppercase text-ni-muted">
                Your Cart
              </p>
              <p className="font-heading text-base font-bold text-ni-primary mt-0.5">
                {totalItems} item{totalItems !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-ni-muted hover:text-ni-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-sm cursor-pointer"
              aria-label="Close cart panel"
            >
              ✕
            </button>
          </div>

          {/* Body: Items or Empty Warning State */}
          {totalItems === 0 ? (
            <div className="px-5 py-8 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5 border border-amber-500/20 shadow-inner">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" fill="currentColor"/>
                  <circle cx="19" cy="21" r="1" fill="currentColor"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-body text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-amber-500/20">
                <span>⚠️ Cart is Empty</span>
              </div>

              <h4 className="font-heading text-lg font-extrabold text-ni-primary mb-1.5">
                Your cart is empty
              </h4>

              <p className="font-body text-xs sm:text-sm text-ni-secondary max-w-[260px] leading-relaxed mb-4">
                You haven't selected any powders yet. Browse our catalog or quickly add popular ingredients below:
              </p>

              {/* 1-Click Popular Add Pills */}
              <div className="w-full mb-6 text-left">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wider text-ni-muted mb-2 text-center">
                  1-Click Quick Add
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {POPULAR_RECOMMENDATIONS.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => addToBasket(rec)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-ni-rust/10 dark:hover:bg-ni-rust/20 border border-neutral-200 dark:border-neutral-700 hover:border-ni-rust text-[11px] font-body font-bold text-ni-primary hover:text-ni-rust transition-colors cursor-pointer"
                    >
                      <span className="text-ni-rust font-extrabold">+</span>
                      <span>{rec.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleEmptyCartAction}
                className="w-full py-3 px-5 rounded-full bg-ni-rust hover:bg-ni-rust-lt text-white font-body text-xs sm:text-sm font-bold uppercase tracking-wider shadow-card hover:shadow-hover transition-all btn-press cursor-pointer"
              >
                Explore 40 Powders →
              </button>
            </div>
          ) : (
            <>
              {/* Items list */}
              <ul className="px-5 py-4 space-y-3.5 max-h-64 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                {basket.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2.5 group">
                    {/* Dot + name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-ni-rust flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-body text-sm font-semibold text-ni-primary truncate leading-snug">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-ni-muted mt-0.5">
                          {item.sku}
                        </p>
                      </div>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded bg-ni-surface2 text-ni-muted hover:text-ni-primary transition-all text-xs font-bold leading-none cursor-pointer"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => setItemQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                        aria-label={`Quantity for ${item.name} in kg`}
                        className="w-9 text-center font-body text-xs font-bold text-ni-primary bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded py-0.5 outline-none focus:ring-1 focus:ring-ni-rust appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-6 h-6 flex items-center justify-center rounded bg-ni-surface2 text-ni-muted hover:text-ni-primary transition-all text-xs font-bold leading-none cursor-pointer"
                      >
                        +
                      </button>
                      <span className="font-body text-xs text-ni-muted ml-0.5">kg</span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromBasket(item.id)}
                      className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold text-xs flex-shrink-0 cursor-pointer"
                      aria-label={`Remove ${item.name} from cart`}
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
              <div className="px-5 pb-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                <button
                  onClick={() => { setIsOpen(false); router.push('/contact') }}
                  className="w-full bg-ni-rust text-white font-body text-sm font-bold uppercase tracking-widest py-3.5 rounded-full hover:bg-ni-rust-lt hover:shadow-premium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 btn-press cursor-pointer"
                >
                  Proceed to Checkout →
                </button>
                <p className="font-body text-xs text-ni-secondary text-center mt-2.5">
                  Quantities adjustable · Single or bulk dispatches
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Trigger button (Visible when items in basket) ─────────────── */}
        {totalItems > 0 && (
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`
              pointer-events-auto
              flex items-center gap-2.5 px-4.5 py-3
              bg-white dark:bg-[#1A1A1D] rounded-full shadow-2xl border border-neutral-200 dark:border-neutral-800
              transition-all duration-200
              hover:scale-105 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg
              btn-press cursor-pointer
            `}
            aria-label={`Cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}. Click to ${isOpen ? 'close' : 'view'}.`}
            aria-expanded={isOpen}
          >
            <span className="text-ni-rust"><CartBagIcon /></span>
            <span className="flex items-center gap-2">
              <span className="font-body text-sm font-bold text-ni-primary">
                Cart
              </span>
              <span className="w-5 h-5 rounded-full bg-ni-rust text-white font-body text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            </span>
          </button>
        )}
      </div>
    </>
  )
}
