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
          fixed z-50 bg-[#FDFCF8] dark:bg-[#18181B] text-neutral-900 dark:text-white shadow-2xl flex flex-col overflow-hidden
          transition-all duration-500 ease-out border border-neutral-300 dark:border-white/15

          /* Mobile layout */
          bottom-0 left-0 right-0 max-h-[92svh] rounded-t-[32px] md:rounded-[32px]

          /* Laptop / Desktop Floating Card layout */
          md:top-6 md:bottom-6 md:right-6 md:left-auto md:w-full md:max-w-xl md:h-[calc(100vh-3rem)]

          ${isOpen
            ? 'translate-y-0 md:translate-x-0 opacity-100'
            : 'translate-y-full md:translate-y-0 md:translate-x-full opacity-0'
          }
        `}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="md:hidden flex justify-center pt-3 pb-1 bg-[#FDFCF8] dark:bg-[#18181B]" aria-hidden="true">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Fixed top bar with Close Button & Ambient Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-white/10 relative z-20 bg-[#FDFCF8] dark:bg-[#18181B]">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full ring-2 ring-white/20 shadow-sm"
              style={{ backgroundColor: product.swatchHex || '#BC4B20' }}
            />
            <span className="font-body text-xs font-black uppercase tracking-widest text-[#BC4B20]">
              {product.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center font-body text-sm font-bold text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-all rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC4B20]"
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
                style={{ backgroundColor: product.swatchHex || '#BC4B20' }}
              />
              <Image
                src={product.imageSrc}
                alt={`${product.name} — product visual`}
                fill
                className={`relative object-contain drop-shadow-xl transition-transform duration-500 ${
                  isReplacedImage
                    ? 'p-2 scale-110 sm:scale-115 hover:scale-125'
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
              {/* Requirement: Structured Commercial H2 Tag */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-ni-rust bg-ni-rust/10 border border-ni-rust/20 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block mb-2">
                    Commercial Specification Sheet
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white leading-snug">
                    Bulk {product.name} Supplier & Wholesale Distributor
                  </h2>
                </div>
                <span className="font-mono text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-200/80 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-neutral-300/60 dark:border-white/10 self-start">
                  {product.sku}
                </span>
              </div>

              {product.tagline && (
                <p className="font-body text-xs font-black text-[#BC4B20] uppercase tracking-wider mt-2">
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
                <h3 className="font-body text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                  Technical Specifications Table
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Batch Verified
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-white/15 bg-white dark:bg-white/[0.03] shadow-xs">
                <table className="w-full text-xs text-left border-collapse font-body">
                  <tbody>
                    <tr className="border-b border-neutral-200/60 dark:border-white/10">
                      <td className="px-4 py-3 font-bold text-neutral-500 dark:text-neutral-400 w-1/3">Mesh Size / Form</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white text-right">{product.mesh || '80–100 Mesh Fine'}</td>
                    </tr>
                    <tr className="border-b border-neutral-200/60 dark:border-white/10">
                      <td className="px-4 py-3 font-bold text-neutral-500 dark:text-neutral-400">Technical Grade</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white text-right">Industrial Food Grade</td>
                    </tr>
                    <tr className="border-b border-neutral-200/60 dark:border-white/10">
                      <td className="px-4 py-3 font-bold text-neutral-500 dark:text-neutral-400">Minimum Order Qty (MOQ)</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white text-right">{product.weights[0]} (Sample) / {product.weights[product.weights.length - 1] || '25kg'} (Commercial Bag)</td>
                    </tr>
                    <tr className="border-b border-neutral-200/60 dark:border-white/10">
                      <td className="px-4 py-3 font-bold text-neutral-500 dark:text-neutral-400">Packaging Format</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white text-right">{product.packagingSize || '25 KG Corrugated Moisture-Barrier Box'}</td>
                    </tr>
                    <tr className="border-b border-neutral-200/60 dark:border-white/10">
                      <td className="px-4 py-3 font-bold text-neutral-500 dark:text-neutral-400">Shelf Life</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white text-right">24 Months from Harvest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-neutral-500 dark:text-neutral-400">Certifications & Quality</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 text-right">FSSAI, Non-GMO, Lab Tested COA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purity Standard & Available Packaging Weights */}
            <div className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <span className="font-body text-xs font-bold text-neutral-900 dark:text-white">
                  100% Pure Single-Ingredient (Zero Fillers / Zero Anti-Caking)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-ni-rust bg-ni-rust/10 px-2.5 py-1 rounded-lg border border-ni-rust/20">
                {product.weights.join(' · ')}
              </span>
            </div>

            {/* Industry Applications Tags */}
            {product.usageApplications && product.usageApplications.length > 0 && (
              <div>
                <h3 className="font-body text-xs font-black uppercase tracking-widest text-neutral-900 dark:text-white mb-3">
                  Recommended Industrial Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.usageApplications.map((app) => (
                    <span
                      key={app}
                      className="font-body text-[10px] font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 border border-neutral-300/80 dark:border-white/15 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/[0.06]"
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
        <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-white/10 bg-[#FDFCF8] dark:bg-[#18181B] z-20 flex items-center gap-3">
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
            className="py-4 px-4 sm:px-6 rounded-full border border-neutral-300 dark:border-white/15 hover:border-[#BC4B20] text-neutral-700 dark:text-neutral-200 font-body text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-white/5 active:scale-95 btn-press whitespace-nowrap"
            title="Copy direct link to technical specification sheet"
          >
            <span>📋 Copy Spec Link</span>
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
            className={`flex-1 font-body text-xs font-black uppercase tracking-wider py-4 transition-all duration-300 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] btn-press ${
              inBasket
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#BC4B20] text-white shadow-card hover:bg-[#D45E30] hover:shadow-hover hover:-translate-y-0.5'
            }`}
          >
            {inBasket ? '✓ In Cart' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </>
  )
}
