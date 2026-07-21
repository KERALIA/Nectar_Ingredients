'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import CartItem from './CartItem'
import { formatINR } from '@/lib/pricing'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.closest('[aria-hidden="true"]'))
}

export default function CartDrawer() {
  const { cart, listTotal, isCartOpen, setIsCartOpen } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Manage focus
  useEffect(() => {
    if (isCartOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setTimeout(() => {
        const closeBtn = panelRef.current?.querySelector<HTMLElement>('button')
        closeBtn?.focus()
      }, 100)
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [isCartOpen])

  // Keyboard trap + Escape key
  useEffect(() => {
    if (!isCartOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false)
        return
      }

      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = getFocusableElements(panel)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isCartOpen, setIsCartOpen])

  // Lock body scroll
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-md transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed z-50 inset-y-0 right-0 w-full max-w-md bg-ni-surface shadow-premium flex flex-col transition-spring ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ni-border/10">
          <h2 className="font-heading text-lg font-bold text-ni-primary">
            Shopping Cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center font-body text-lg text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-all rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust cursor-pointer"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <span className="text-3xl mb-4" aria-hidden="true">
                🛍️
              </span>
              <p className="font-body text-sm text-ni-muted">
                Your cart is empty.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 font-body text-xs font-bold uppercase tracking-widest text-ni-rust hover:text-ni-rust-lt transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map((item) => (
                <CartItem key={item.sku} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div
            className="flex-none px-6 py-6 border-t border-ni-border/10 bg-ni-surface"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-body text-sm font-semibold text-ni-secondary uppercase tracking-wider">
                Subtotal (List Total)
              </span>
              <span className="font-body text-lg font-bold text-ni-primary">
                {formatINR(listTotal)}
              </span>
            </div>

            <p className="font-body text-[10px] text-ni-muted mb-4 leading-normal">
              Final totals and payment method discounts will be calculated at checkout.
            </p>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[11px] py-4 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-premium active:scale-[0.97] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-surface"
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
