'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Product } from '../../types'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { User } from '@supabase/supabase-js'

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

const TARGET_REPLACED_IMAGES = new Set([
  '/Images/Amla_Powder.webp',
  '/Images/Annatto_Colour.webp',
  '/Images/Banana_Powder.webp',
  '/Images/Beetroot_Powder.webp',
  '/Images/Butter_Powder.webp',
  '/Images/Caramel_Colour.webp',
  '/Images/Carrot_Powder.webp',
  '/Images/Cheese_Powder.webp',
  '/Images/Cream_Powder.webp',
  '/Images/Curd_Powder.webp',
  '/Images/Garlic_Powder.webp',
  '/Images/Ginger_Powder.webp',
  '/Images/Lemon_Powder.webp',
  '/Images/Mango_Powder.webp',
  '/Images/Onion_Powder.webp',
  '/Images/Orange_Powder.webp',
  '/Images/Pomegranate_Powder.webp',
  '/Images/Spinach_Powder.webp',
  '/Images/Strawberry_Powder.webp',
  '/Images/Tamarind_Powder.webp',
  '/Images/Tomato_Powder.webp',
  '/Images/Turmeric_Powder.webp',
])

export default function ProductDrawer({
  product,
  isOpen,
  onClose,
  price,
  user = null,
}: ProductDrawerProps) {
  const isReplacedImage = product?.imageSrc ? TARGET_REPLACED_IMAGES.has(product.imageSrc) : false
  const { toggleBasket, isInBasket } = useSampleBasket()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

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
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        Product Detail Modal Container — 100% Solid Opaque Background for all 40 powders!
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} technical specifications`}
        className={`
          fixed z-50 bg-ni-surface text-ni-primary shadow-2xl flex flex-col overflow-hidden
          transition-[transform,opacity] duration-300 ease-out border border-ni-border/30

          /* Mobile layout */
          bottom-0 left-0 right-0 max-h-[92svh] rounded-t-3xl md:rounded-3xl

          /* Laptop / Desktop Floating Card layout */
          md:top-6 md:bottom-6 md:right-6 md:left-auto md:w-full md:max-w-xl md:h-[calc(100vh-3rem)]

          ${isOpen
            ? 'translate-y-0 md:translate-x-0 opacity-100'
            : 'translate-y-full md:translate-y-0 md:translate-x-full opacity-0'
          }
        `}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="md:hidden flex justify-center pt-3 pb-1 bg-ni-surface" aria-hidden="true">
          <div className="w-12 h-1.5 rounded-full bg-ni-border/50" />
        </div>

        {/* Fixed top bar with Close Button & Ambient Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ni-border/20 relative z-20 bg-ni-surface">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full ring-2 ring-white/20 shadow-sm"
              style={{ backgroundColor: product.swatchHex || 'var(--rust)' }}
            />
            <span className="font-body text-xs font-semibold text-ni-rust">
              {product.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-body text-sm font-semibold text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust"
            aria-label="Close specifications"
          >
            ✕
          </button>
        </div>

        {/*
          Scrollable Body Section — Assigned to mouse wheel scroll!
        */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain touch-pan-y"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Product Image Area with Swatch Glow */}
          {product.imageSrc && (
            <div
              className="relative w-full overflow-hidden flex items-center justify-center p-8 bg-neutral-100/70 dark:bg-white/[0.04] border-b border-neutral-200/60 dark:border-white/10"
              style={{ aspectRatio: '16/9' }}
            >
              <div
                className="absolute w-40 h-40 rounded-full filter blur-[32px] opacity-35 pointer-events-none"
                style={{ backgroundColor: product.swatchHex || 'var(--rust)' }}
              />
              <Image
                src={product.imageSrc}
                alt={`${product.name} — product visual`}
                fill
                className={`relative object-contain drop-shadow-xl transition-transform duration-300 motion-reduce:transition-none ${
                  isReplacedImage
                    ? 'p-2 scale-110 sm:scale-115 hover:scale-120'
                    : 'p-6 hover:scale-105'
                }`}
                sizes="(max-width: 768px) 100vw, 512px"
                priority
              />
            </div>
          )}

          {/* Content Specs Body — High Contrast Typography */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-ni-primary leading-snug">
                    Bulk {product.name} Supplier &amp; Wholesale Distributor
                  </h2>
                </div>
                <span className="font-mono text-xs font-semibold text-ni-secondary bg-ni-surface2 px-2.5 py-1 rounded-lg border border-ni-border/30 self-start">
                  {product.sku}
                </span>
              </div>

              {product.tagline && (
                <p className="font-body text-xs font-medium text-ni-rust mt-1.5">
                  {product.tagline}
                </p>
              )}

              {/* Exact Wholesale B2B Introduction Sentence */}
              <p className="font-body text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed mt-3 p-3.5 rounded-xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/10">
                Nectar Ingredients is a premier industrial food ingredients {product.name.toLowerCase()} distributor, offering wholesale commercial pricing for manufacturing scales.
              </p>

              <p className="font-body text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            {/* Complete Micro-Data Technical Specifications Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-body text-xs font-semibold text-ni-primary">
                  Technical specifications
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Batch verified
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-ni-border/30 bg-ni-surface">
                <table className="w-full text-xs text-left border-collapse font-body">
                  <tbody>
                    <tr className="border-b border-ni-border/20">
                      <td className="px-4 py-2.5 font-bold text-ni-muted w-1/3">Mesh size and form</td>
                      <td className="px-4 py-2.5 font-semibold text-ni-primary text-right">{product.mesh || '80 to 100 Mesh Fine'}</td>
                    </tr>
                    <tr className="border-b border-ni-border/20">
                      <td className="px-4 py-2.5 font-bold text-ni-muted">Technical grade</td>
                      <td className="px-4 py-2.5 font-semibold text-ni-primary text-right">Industrial food grade</td>
                    </tr>
                    <tr className="border-b border-ni-border/20">
                      <td className="px-4 py-2.5 font-bold text-ni-muted">Minimum order quantity (MOQ)</td>
                      <td className="px-4 py-2.5 font-semibold text-ni-primary text-right">{product.weights[0]} (Sample) / {product.weights[product.weights.length - 1] || '25kg'} (Commercial Bag)</td>
                    </tr>
                    <tr className="border-b border-ni-border/20">
                      <td className="px-4 py-2.5 font-bold text-ni-muted">Packaging format</td>
                      <td className="px-4 py-2.5 font-semibold text-ni-primary text-right">{product.packagingSize || '25 KG Corrugated Moisture-Barrier Box'}</td>
                    </tr>
                    <tr className="border-b border-ni-border/20">
                      <td className="px-4 py-2.5 font-bold text-ni-muted">Shelf life</td>
                      <td className="px-4 py-2.5 font-semibold text-ni-primary text-right">24 months from harvest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-ni-muted">Certifications and quality</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 text-right">FSSAI, Non-GMO, Lab Tested CoA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purity Standard & Available Packaging Weights */}
            <div className="p-3.5 rounded-xl border border-ni-border/30 bg-ni-surface2/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-body text-xs font-semibold text-ni-primary">
                  100% Pure single-ingredient (zero fillers or anti-caking)
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-ni-rust bg-ni-rust/10 px-2 py-0.5 rounded border border-ni-rust/20">
                {product.weights.join(' · ')}
              </span>
            </div>

            {/* Industry Applications Tags */}
            {product.usageApplications && product.usageApplications.length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-ni-primary mb-2.5">
                  Recommended industrial applications
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.usageApplications.map((app) => (
                    <span
                      key={app}
                      className="font-body text-xs text-ni-secondary border border-ni-border/30 px-2.5 py-1 rounded-lg bg-ni-surface"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Sticky CTA Footer with Share Spec Link + Sample Box */}
        <div className="p-4 sm:p-6 border-t border-ni-border/20 bg-ni-surface z-20 flex items-center gap-3">
          {/* Share / Copy Spec Sheet Link */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const url = `${window.location.origin}/products#product-${product.slug}`
                navigator.clipboard?.writeText(url)
                alert(`Direct link copied: ${url}`)
              }
            }}
            className="py-3 px-4 rounded-xl border border-ni-border/40 hover:border-ni-rust text-ni-secondary hover:text-ni-primary font-body text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust whitespace-nowrap"
            title="Copy direct link to technical specification sheet"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Spec Link</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() =>
              toggleBasket({
                id: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                category: product.category,
              })
            }
            aria-label={inBasket ? `Remove ${product.name} from cart` : `Add ${product.name} to cart`}
            aria-pressed={inBasket}
            className={`flex-1 font-body text-xs font-semibold py-3 transition-colors duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
              inBasket
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-ni-rust text-white shadow-sm hover:bg-ni-rust-lt'
            }`}
          >
            {inBasket ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </>
  )
}
