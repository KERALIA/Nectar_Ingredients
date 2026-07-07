'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Product } from '../../types'
import { useSampleBasket } from '../../context/SampleBasketContext'

interface ProductDrawerProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

// C-4 Fix: Returns all focusable elements inside a container.
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.closest('[aria-hidden="true"]'))
}

export default function ProductDrawer({ product, isOpen, onClose }: ProductDrawerProps) {
  const { toggleBasket, isInBasket } = useSampleBasket()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Focus management: save caller focus, restore on close
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

  // C-4 Fix: Full focus trap — Tab cycles within the drawer, Shift+Tab cycles backwards.
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
        // Shift+Tab: if focus is on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: if focus is on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
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
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} technical specifications`}
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-ni-surface shadow-2xl transition-transform duration-300 ease-in-out transform overflow-y-auto border-l border-ni-border ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center font-body text-lg text-ni-muted hover:text-ni-primary hover:bg-ni-surface2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust"
          aria-label="Close specifications"
        >
          ✕
        </button>

        {/* Product image — full width editorial crop */}
        {product.imageSrc && (
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={product.imageSrc}
              alt={`${product.name} — product photograph`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, 512px"
              priority
            />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--surface))' }}
            />
          </div>
        )}

        {/* Content area */}
        <div className="px-8 pb-8 -mt-2 relative z-[1]">
          {/* Category + title */}
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: product.swatchHex }} aria-hidden="true" />
            <span className="font-body text-xs tracking-widest text-ni-rust uppercase">
              {product.category}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-semibold text-ni-primary mt-2 leading-tight">
            {product.name}
          </h2>
          <p className="font-body text-base text-ni-secondary italic mt-1">
            {product.tagline}
          </p>
          <p className="font-body text-sm text-ni-muted leading-relaxed mt-4">
            {product.description}
          </p>

          {/* Technical Specifications Table */}
          <div className="mt-8 border border-ni-border">
            <div className="grid grid-cols-2 gap-px bg-ni-border">
              {/* Header row */}
              <div className="bg-ni-surface2 px-4 py-3">
                <span className="font-body text-[11px] font-medium tracking-widest text-ni-muted uppercase">Specification</span>
              </div>
              <div className="bg-ni-surface2 px-4 py-3">
                <span className="font-body text-[11px] font-medium tracking-widest text-ni-muted uppercase">Details</span>
              </div>

              {/* SKU */}
              <div className="bg-ni-bg px-4 py-3">
                <span className="font-body text-sm font-medium text-ni-secondary">SKU</span>
              </div>
              <div className="bg-ni-bg px-4 py-3">
                <span className="font-mono text-sm text-ni-primary">{product.sku}</span>
              </div>

              {/* Category */}
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm font-medium text-ni-secondary">Category</span>
              </div>
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm text-ni-primary capitalize">{product.category}</span>
              </div>

              {/* Mesh Size */}
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm font-medium text-ni-secondary">Mesh / Particle Size</span>
              </div>
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm text-ni-primary">{product.mesh}</span>
              </div>

              {/* Packaging */}
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm font-medium text-ni-secondary">Standard Packaging</span>
              </div>
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm text-ni-primary">{product.packagingSize || '25 KG Corrugated Box'}</span>
              </div>

              {/* Available Weights */}
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm font-medium text-ni-secondary">Available Weights</span>
              </div>
              <div className="bg-ni-bg px-4 py-3 border-t border-ni-border">
                <span className="font-body text-sm text-ni-primary">{product.weights.join(' · ')}</span>
              </div>
            </div>
          </div>

          {/* Industry Applications */}
          {product.usageApplications && product.usageApplications.length > 0 && (
            <div className="mt-8">
              <h3 className="font-body text-xs font-medium tracking-widest text-ni-muted uppercase mb-3">
                Target Applications
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.usageApplications.map((app) => (
                  <span
                    key={app}
                    className="font-body text-xs text-ni-secondary border border-ni-border2 px-3 py-1.5"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-10 pt-6 border-t border-ni-border">
            <button
              onClick={() => toggleBasket({
                id: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                category: product.category,
              })}
              aria-label={inBasket ? `Remove ${product.name} from sample box` : `Add ${product.name} to sample box`}
              aria-pressed={inBasket}
              className={`w-full font-body text-sm font-medium py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-surface ${
                inBasket
                  ? 'bg-ni-border2 text-ni-primary hover:bg-ni-border'
                  : 'bg-ni-rust text-white hover:bg-ni-rust-lt'
              }`}
            >
              {inBasket ? '✓ Added to Sample Box — Remove' : `Add ${product.name} to Sample Box →`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
