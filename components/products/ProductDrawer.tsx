'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Product } from '../../types'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { User } from '@supabase/supabase-js'
import { computeListPrice, formatINR } from '@/lib/pricing'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'

interface ProductDrawerProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  price?: number
  user?: User | null
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.closest('[aria-hidden="true"]'))
}

export default function ProductDrawer({
  product,
  isOpen,
  onClose,
  price,
  user = null,
}: ProductDrawerProps) {
  const { toggleBasket, isInBasket } = useSampleBasket()
  const { addToCart } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const handleSignIn = async () => {
    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
        },
      })
    } catch (err) {
      console.error('Sign in error:', err)
    }
  }

  // Manage focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      setTimeout(() => {
        const closeBtn = panelRef.current?.querySelector<HTMLElement>('button')
        closeBtn?.focus()
      }, 100)
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [isOpen])

  // Keyboard trap + Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
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
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!product) return null

  const inBasket = isInBasket(product.id)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        Drawer Panel
        ─ Mobile (< md):   bottom sheet — slides up from the bottom, full width
        ─ Desktop (>= md): right panel — slides in from the right, max-w-xl
      */}
      {/*
        Drawer Panel — three-zone layout:
          1. Fixed header  : drag handle + close button (always visible)
          2. Scrollable body : image + all content (overflow-y-auto)
          3. Sticky CTA footer : "Add to Sample Box" always pinned at bottom
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} technical specifications`}
        className={`
          fixed z-50 bg-ni-surface shadow-premium flex flex-col
          transition-spring

          /* Mobile — bottom sheet */
          bottom-0 left-0 right-0
          max-h-[92svh] rounded-t-[28px]
          md:rounded-none

          /* Desktop — right panel */
          md:bottom-auto md:inset-y-0 md:right-0 md:left-auto
          md:w-full md:max-w-xl md:h-full

          ${isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
      >
        {/* ── Zone 1: Fixed top bar (drag handle + close button) ─────────── */}
        <div className="flex-none relative">
          {/* Drag handle — mobile visual cue */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-ni-border2/50" aria-hidden="true" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 md:top-4 md:right-5 z-10 w-10 h-10 flex items-center justify-center font-body text-lg text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-all rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust"
            aria-label="Close specifications"
          >
            ✕
          </button>
        </div>

        {/* ── Zone 2: Scrollable body ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Product image */}
          {product.imageSrc && (
            <div
              className="relative w-full overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-ni-surface2/50 to-ni-surface"
              style={{ aspectRatio: '16/9' }}
            >
              {/* Ambient swatch color glow */}
              <div
                className="absolute w-32 h-32 rounded-full filter blur-[24px] opacity-[0.25] pointer-events-none"
                style={{ backgroundColor: product.swatchHex }}
              />
              <Image
                src={product.imageSrc}
                alt={`${product.name} — product photograph`}
                fill
                className="relative object-contain p-8 transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 512px"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="px-5 sm:px-8 pt-2 pb-6 relative z-[1]">
            {/* Category + title */}
            <div className="flex items-center gap-3 mb-1 mt-4 sm:mt-6">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: product.swatchHex }}
                aria-hidden="true"
              />
              <span className="font-body text-[10px] font-bold tracking-[0.2em] text-ni-rust uppercase">
                {product.category}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mt-2 leading-tight">
              {product.name}
            </h2>
            <p className="font-body text-xs font-semibold text-ni-muted uppercase tracking-wider mt-1">
              {product.tagline}
            </p>
            <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mt-4">
              {product.description}
            </p>

            {/* Technical Specifications */}
            <div className="mt-6 sm:mt-8 space-y-2">
              {[
                { label: 'SKU',                  value: product.sku,                              isMono: true },
                { label: 'List Price',           value: price !== undefined ? `${formatINR(computeListPrice(price))}/kg` : 'Price on request' },
                { label: 'Category',             value: product.category,                         isCapitalize: true },
                { label: 'Mesh / Particle Size', value: product.mesh },
                { label: 'Standard Packaging',   value: product.packagingSize || '25 KG Corrugated Box' },
                { label: 'Available Weights',    value: product.weights.join(' · ') },
              ].map((spec, idx) => (
                <div
                  key={spec.label}
                  className={`flex justify-between items-center px-4 py-3 sm:py-3.5 rounded-lg border border-ni-border/10 ${
                    idx % 2 === 0 ? 'bg-ni-surface2/40' : 'bg-transparent'
                  }`}
                >
                  <span className="font-body text-xs font-bold text-ni-primary uppercase tracking-wider">
                    {spec.label}
                  </span>
                  <span
                    className={`font-body text-sm text-ni-secondary text-right ${
                      spec.isMono ? 'font-mono text-xs font-semibold' : ''
                    } ${spec.isCapitalize ? 'capitalize' : ''}`}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Industry Applications */}
            {product.usageApplications && product.usageApplications.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="font-body text-xs font-bold tracking-widest text-ni-muted uppercase mb-3">
                  Target Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.usageApplications.map((app) => (
                    <span
                      key={app}
                      className="font-body text-[10px] font-bold uppercase tracking-widest text-ni-secondary border border-ni-border/20 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-ni-surface2/60"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Zone 3: Sticky CTA footer ───────────────────────────────────── */}
        <div
          className="flex-none px-5 sm:px-8 py-4 border-t border-ni-border/15 bg-ni-surface"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() =>
                toggleBasket({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  category: product.category,
                })
              }
              aria-label={
                inBasket
                  ? `Remove ${product.name} from sample box`
                  : `Add ${product.name} to sample box`
              }
              aria-pressed={inBasket}
              className={`flex-1 font-body text-xs font-bold uppercase tracking-widest py-3.5 transition-all duration-200 rounded-full active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-surface ${
                inBasket
                  ? 'bg-ni-surface2 text-ni-primary hover:bg-ni-border'
                  : 'bg-transparent border border-ni-rust text-ni-rust hover:bg-ni-rust hover:text-white hover:-translate-y-0.5'
              }`}
            >
              {inBasket ? '✓ In Sample Box' : 'Add to Sample Box'}
            </button>

            {price !== undefined && (
              user ? (
                <button
                  onClick={() => addToCart(product.sku, product.name, price)}
                  className="flex-1 font-body text-xs font-bold uppercase tracking-widest py-3.5 bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-surface cursor-pointer"
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex-1 font-body text-xs font-bold uppercase tracking-widest py-3.5 bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-ni-surface cursor-pointer"
                >
                  Sign in to Order
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </>
  )
}
