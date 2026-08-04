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
  showDescription = false,
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

  /* Intersection Observer for smooth reveal */
  useEffect(() => {
    if (!cardRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '40px 0px' }
    )
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  const { toggleBasket, isInBasket } = useSampleBasket()
  const inBasket = isInBasket(product.id)

  const handleClick = () => {
    if (onOpenDrawer) {
      onOpenDrawer(product)
    } else {
      router.push(`/products#product-${product.slug}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <article
      ref={cardRef}
      id={product.slug}
      data-legacy-id={`product-${product.slug}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`View details for Bulk ${product.name} Supplier & Wholesale Distributor`}
      className={`
        relative flex flex-col h-full group cursor-pointer rounded-[24px] overflow-hidden
        transition-all duration-500 ease-out border backdrop-blur-md
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${
          highlighted
            ? 'bg-[#FAF0EB] dark:bg-[#2A1A10] border-ni-rust ring-2 ring-ni-rust ring-inset shadow-hover'
            : 'bg-white dark:bg-[#18181B] border-neutral-200/80 dark:border-white/10 hover:border-[#BC4B20]/50 shadow-md hover:shadow-2xl hover:-translate-y-1.5'
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
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shadow-sm"
            style={{ backgroundColor: product.swatchHex || '#BC4B20' }}
            aria-hidden="true"
          />
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border cat-badge-${product.category}`}>
            {product.category}
          </span>
        </div>
        <span className="font-mono text-[10px] font-medium text-ni-muted/80 bg-ni-surface2/60 dark:bg-white/5 px-2 py-0.5 rounded-md border border-ni-border/10">
          {product.sku}
        </span>
      </div>

      {/* Image Area with Ambient Swatch Color Glow */}
      <div className="px-4 pt-3 pb-2">
        <div
          className={`relative w-full overflow-hidden flex items-center justify-center rounded-[20px] bg-gradient-to-b from-ni-surface2/40 via-ni-surface2/20 to-transparent dark:from-white/[0.04] dark:to-transparent transition-all duration-500 group-hover:bg-ni-surface2/60 ${
            isReplacedImage ? 'p-2' : 'p-6'
          }`}
          style={{ aspectRatio: '4/3' }}
        >
          {/* Ambient Swatch Color Glow Effect */}
          <div
            className="absolute w-32 h-32 rounded-full filter blur-[24px] opacity-30 pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-50"
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
                  ? 'p-0 scale-110 sm:scale-115 group-hover:scale-125'
                  : 'p-3 group-hover:scale-110'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-ni-muted p-4">
              <svg className="w-10 h-10 opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xs font-semibold">{product.name}</span>
            </div>
          )}

          {/* Quick Details Overlay Badge */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] font-bold uppercase tracking-wider bg-ni-surface/90 dark:bg-black/80 backdrop-blur-md text-ni-primary px-2.5 py-1 rounded-full border border-ni-border/20 shadow-sm">
              Quick View ↗
            </span>
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 pt-2 flex flex-col flex-1">
        {/* Requirement 1: Structured H2 Tag for Search Engine & AI Indexing */}
        <h2 className="font-heading text-base font-bold tracking-tight text-ni-primary group-hover:text-ni-rust transition-colors duration-300 leading-snug">
          Bulk {product.name} Supplier & Wholesale Distributor
        </h2>
        
        {product.tagline && (
          <p className="font-body text-[10px] font-bold text-ni-rust tracking-wide uppercase mt-1">
            {product.tagline}
          </p>
        )}

        {/* Target Keyword Intro Sentence */}
        <p className="font-body text-[11px] text-ni-secondary mt-1.5 leading-relaxed">
          Nectar Ingredients is a premier industrial food ingredients {product.name.toLowerCase()} distributor, offering wholesale commercial pricing for manufacturing scales.
        </p>

        {/* Requirement 2: Micro-Data HTML Specification Table for AI Answer Extraction */}
        <div className="my-3 overflow-hidden rounded-xl border border-ni-border/20 dark:border-white/10 bg-ni-surface2/30 dark:bg-white/[0.02]">
          <table className="w-full text-[10px] text-left border-collapse font-body">
            <tbody>
              <tr className="border-b border-ni-border/10 dark:border-white/5">
                <td className="px-2.5 py-1 font-bold text-ni-muted">Mesh Size / Form</td>
                <td className="px-2.5 py-1 font-semibold text-ni-primary text-right">{product.mesh || '80-100 Mesh'}</td>
              </tr>
              <tr className="border-b border-ni-border/10 dark:border-white/5">
                <td className="px-2.5 py-1 font-bold text-ni-muted">Technical Grade</td>
                <td className="px-2.5 py-1 font-semibold text-ni-primary text-right">Industrial Food Grade</td>
              </tr>
              <tr className="border-b border-ni-border/10 dark:border-white/5">
                <td className="px-2.5 py-1 font-bold text-ni-muted">MOQ</td>
                <td className="px-2.5 py-1 font-semibold text-ni-primary text-right">{product.weights[0]} (Sample) / {product.weights[product.weights.length - 1] || '25kg'} (Bag)</td>
              </tr>
              <tr className="border-b border-ni-border/10 dark:border-white/5">
                <td className="px-2.5 py-1 font-bold text-ni-muted">Shelf Life</td>
                <td className="px-2.5 py-1 font-semibold text-ni-primary text-right">24 Months</td>
              </tr>
              <tr>
                <td className="px-2.5 py-1 font-bold text-ni-muted">Certifications</td>
                <td className="px-2.5 py-1 font-semibold text-ni-primary text-right">FSSAI, Non-GMO, Lab Tested COA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Short Description */}
        <p className="font-body text-xs text-ni-secondary leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Usage Application Tags */}
        {product.usageApplications && product.usageApplications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Applications">
            {product.usageApplications.slice(0, 3).map((app) => (
              <span
                key={app}
                className="font-body text-[9px] font-semibold text-ni-muted bg-ni-surface2/60 dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-ni-border/10"
              >
                {app}
              </span>
            ))}
          </div>
        )}

        {/* Specifications Bar (Weights & Mesh) */}
        <div className="mt-auto pt-3 border-t border-ni-border/20 dark:border-white/5 my-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-ni-secondary text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>100% Pure Powder</span>
          </div>
          <span className="font-body text-[10px] font-bold text-ni-muted uppercase tracking-wider">
            {product.weights.slice(0, 2).join(' · ')}
          </span>
        </div>

        {/* Action Button: Sample Box Toggle */}
        <button
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
          aria-label={inBasket ? `Remove ${product.name} from sample box` : `Add ${product.name} to sample box`}
          aria-pressed={inBasket}
          className={`w-full font-body text-[11px] font-extrabold uppercase tracking-wider py-3 transition-all duration-300 rounded-full flex items-center justify-center gap-2 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
            inBasket
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              : 'bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-card hover:-translate-y-0.5'
          }`}
        >
          {inBasket ? (
            <>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Added to Sample Box</span>
            </>
          ) : (
            <>
              <span>Add to Sample Box</span>
              <span className="text-xs">+</span>
            </>
          )}
        </button>
      </div>
    </article>
  )
}
