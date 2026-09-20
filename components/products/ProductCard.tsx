'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Product } from '../../types'
import Image from 'next/image'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
  showDescription?: boolean
  highlighted?: boolean
  onOpenDrawer?: (product: Product) => void
  priority?: boolean
  price?: number
  user?: User | null
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

export default function ProductCard({
  product,
  showDescription = true,
  highlighted = false,
  onOpenDrawer,
  priority = false,
  price,
  user = null,
}: ProductCardProps) {
  const isReplacedImage = product.imageSrc ? TARGET_REPLACED_IMAGES.has(product.imageSrc) : false
  const router = useRouter()
  const cardRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [imgError, setImgError] = useState(false)

  /* Intersection Observer with pre-emptive reveal to prevent scroll pauses */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    if (!cardRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '160px 0px 40px 0px' }
    )
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const { toggleBasket, isInBasket } = useSampleBasket()
  const inBasket = isInBasket(product.id)

  const handleOpenSpecs = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (onOpenDrawer) {
      onOpenDrawer(product)
    } else {
      router.push(`/products#product-${product.slug}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleOpenSpecs()
    }
  }

  return (
    <article
      ref={cardRef}
      id={product.slug}
      data-legacy-id={`product-${product.slug}`}
      role="button"
      tabIndex={0}
      onClick={() => handleOpenSpecs()}
      onKeyDown={handleKeyDown}
      aria-label={`Bulk ${product.name} Supplier & Wholesale Distributor — Nectar Ingredients`}
      className={`
        scroll-mt-28 relative flex flex-col h-full group cursor-pointer rounded-[24px] overflow-hidden
        transition-all duration-300 ease-out border backdrop-blur-md hairline-card select-none transform-gpu
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${
          highlighted
            ? 'bg-[#FAF0EB] dark:bg-[#2A1A10] border-[#BC4B20] ring-4 ring-[#BC4B20]/40 ring-inset shadow-2xl scale-[1.02]'
            : 'bg-white dark:bg-[#18181B] border-neutral-200/80 dark:border-white/10 hover:border-[#BC4B20]/60 shadow-card hover:shadow-2xl hover:-translate-y-1.5'
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust
      `}
    >
      {/* Secondary legacy anchor for backward compatibility */}
      <span id={`product-${product.slug}`} className="sr-only" aria-hidden="true" />

      {/* Top Banner Bar: Category + SKU Badge */}
      <div className="p-4 pb-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30 shadow-sm"
            style={{ backgroundColor: product.swatchHex || '#BC4B20' }}
            aria-hidden="true"
          />
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border cat-badge-${product.category}`}>
            {product.category}
          </span>
        </div>
        <span className="font-mono text-[11px] font-medium text-neutral-400 dark:text-neutral-500 tracking-wider select-none">
          {product.sku}
        </span>
      </div>

      {/* Image Area with Botanical Swatch Tint & Ambient Aura */}
      <div className="px-4 pt-3 pb-2">
        <div
          className={`relative w-full overflow-hidden flex items-center justify-center rounded-[20px] transition-all duration-500 group-hover:shadow-inner ${
            isReplacedImage ? 'p-2' : 'p-6'
          }`}
          style={{
            aspectRatio: '4/3',
            backgroundColor: `${product.swatchHex || '#BC4B20'}0C`,
          }}
        >
          {/* Ambient Swatch Glow Effect */}
          <div
            className="absolute w-32 h-32 rounded-full filter blur-[28px] opacity-25 pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-45"
            style={{ backgroundColor: product.swatchHex || '#BC4B20' }}
          />

          {!imgError && product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={`Bulk ${product.name} Supplier & Wholesale Distributor — Nectar Ingredients`}
              fill
              priority={priority}
              className={`relative object-contain transition-transform duration-700 ease-out drop-shadow-md ${
                isReplacedImage
                  ? 'p-0 scale-110 sm:scale-115 group-hover:scale-120'
                  : 'p-3 group-hover:scale-108'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center text-ni-muted p-4 rounded-xl w-full h-full"
              style={{ backgroundColor: `${product.swatchHex || '#BC4B20'}15` }}
            >
              <span className="text-2xl mb-1">🌿</span>
              <span className="text-xs font-bold text-ni-primary">{product.name}</span>
            </div>
          )}

          {/* Quick Details Overlay Badge */}
          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-[9px] font-black uppercase tracking-wider bg-ni-surface/95 dark:bg-black/85 backdrop-blur-md text-ni-primary px-3 py-1 rounded-full border border-ni-border/30 shadow-md">
              Quick Specs ↗
            </span>
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 pt-2 flex flex-col flex-1">
        {/* Clean, Bold, Authoritative H2 */}
        <h2 className="font-heading text-lg sm:text-xl font-black tracking-tight text-ni-primary group-hover:text-ni-rust transition-colors duration-300 leading-snug">
          {product.name}
        </h2>

        {/* Refined Terracotta Tagline */}
        {product.tagline && (
          <p className="font-body text-[11px] font-extrabold text-ni-rust tracking-wide uppercase mt-1 line-clamp-1">
            {product.tagline}
          </p>
        )}

        {/* Quality Micro-Badge & Price */}
        <div className="flex items-center justify-between gap-2 my-3">
          <span className="inline-flex items-center gap-1.5 font-body text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% Pure</span>
          </span>

          {price && price > 0 && (
            <span className="font-mono text-xs font-bold text-ni-rust bg-ni-rust/10 border border-ni-rust/20 px-2.5 py-0.5 rounded-lg">
              ₹{price}/kg
            </span>
          )}
        </div>

        {/* 2-Line Clamped Description */}
        {showDescription && product.description && (
          <p className="font-body text-xs text-ni-secondary leading-relaxed line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Dual Balanced Action Footer */}
        <div className="mt-auto pt-3 border-t border-ni-border/20 dark:border-white/5 flex items-center gap-2">
          {/* Secondary Action: Quick Specs */}
          <button
            type="button"
            onClick={handleOpenSpecs}
            className="flex-1 py-2.5 px-3 rounded-full border border-ni-border/40 dark:border-white/10 hover:border-ni-rust hover:text-ni-rust font-body text-[11px] font-bold uppercase tracking-wider text-ni-secondary hover:bg-ni-rust/5 transition-all text-center flex items-center justify-center gap-1.5 btn-press active:scale-[0.97] cursor-pointer"
            aria-label={`View full technical specs for ${product.name}`}
          >
            <span>Specs</span>
            <span className="text-xs">↗</span>
          </button>

          {/* Primary Action: Add to Cart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleBasket({
                id: product.id,
                slug: product.slug,
                name: product.name,
                sku: product.sku,
                category: product.category,
              })
            }}
            aria-label={inBasket ? `Remove ${product.name} from cart` : `Add ${product.name} to cart`}
            aria-pressed={inBasket}
            className={`flex-1 py-2.5 px-3 rounded-full font-body text-[11px] font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 btn-press shadow-sm active:scale-[0.97] cursor-pointer ${
              inBasket
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-card hover:-translate-y-0.5'
            }`}
          >
            {inBasket ? (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>In Cart</span>
              </>
            ) : (
              <>
                <span>+ Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
