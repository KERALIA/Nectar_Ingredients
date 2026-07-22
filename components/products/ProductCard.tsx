'use client'

import React, { useState } from 'react'
import { Product } from '../../types'
import Tag from '../ui/Tag'
import Image from 'next/image'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { User } from '@supabase/supabase-js'
import { computeListPrice, formatINR } from '@/lib/pricing'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
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

export default function ProductCard({
  product,
  showDescription = false,
  highlighted = false,
  onOpenDrawer,
  priority = false,
  price,
  user = null,
}: ProductCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const { toggleBasket, isInBasket } = useSampleBasket()
  const { addToCart } = useCart()
  const inBasket = isInBasket(product.id)

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

  const handleClick = (e: React.MouseEvent) => {
    if (onOpenDrawer) {
      onOpenDrawer(product)
    } else {
      router.push(`/products#product-${product.slug}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onOpenDrawer) {
        onOpenDrawer(product)
      } else {
        router.push(`/products#product-${product.slug}`)
      }
    }
  }

  return (
    <article
      id={`product-${product.slug}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${product.name}`}
      className={`
        flex flex-col h-full group cursor-pointer
        transition-all duration-300 rounded-[24px] overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1
        ${highlighted
          ? 'bg-ni-rust-bg ring-2 ring-ni-rust ring-inset'
          : 'bg-ni-surface border border-ni-border/20'
        }
        ${onOpenDrawer ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-inset' : ''}
      `}
    >
      {/* IMAGE AREA — Inset rounded container, custom tinted circular glow behind image */}
      {!imgError && product.imageSrc && (
        <div className="p-4 pb-0">
          <div 
            className="relative w-full overflow-hidden flex items-center justify-center p-6 rounded-[18px] bg-gradient-to-tr from-ni-surface2/50 to-ni-surface transition-colors duration-300" 
            style={{ aspectRatio: '4/3' }}
          >
            {/* Ambient circular swatch color glow behind the product image */}
            <div
              className="absolute w-24 h-24 rounded-full filter blur-[20px] opacity-[0.25] pointer-events-none transition-all duration-500 group-hover:scale-[1.4] group-hover:opacity-[0.35]"
              style={{ backgroundColor: product.swatchHex }}
            />
            <Image
              src={product.imageSrc}
              alt={`${product.name} — product visual`}
              fill
              priority={priority}
              className="relative object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      )}

      {/* TEXT AREA */}
      <div className="p-5 flex flex-col flex-1">
        {showDescription ? (
          /* Catalog Card layout */
          <>
            {/* Swatch circle + Category tag */}
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10 dark:border-white/10"
                style={{ backgroundColor: product.swatchHex }}
                aria-hidden="true"
              />
              <span className={`inline-block text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md border cat-badge-${product.category}`}>
                {product.category}
              </span>
            </div>

            {/* Product name */}
            <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
              {product.name}
            </h3>

            {/* Tagline */}
            <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
              {product.tagline}
            </p>

            {/* Full description */}
            <p className="font-body text-sm text-neutral-600/80 dark:text-neutral-300/80 leading-relaxed mt-4">
              {product.description}
            </p>

            {/* Applications tags (Outline style) */}
            {product.usageApplications && (
              <div className="flex flex-wrap gap-1.5 mt-4 mb-2" aria-label="Usage applications">
                {product.usageApplications.slice(0, 3).map((use) => (
                  <span
                    key={use}
                    className="font-body text-[9px] font-bold uppercase tracking-widest text-ni-secondary border border-ni-border/60 px-2.5 py-1 rounded-full bg-transparent"
                  >
                    {use}
                  </span>
                ))}
              </div>
            )}

             {/* Specifications divider & details */}
            <div className="mt-auto pt-4 border-t border-ni-border/40 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-semibold text-ni-primary uppercase tracking-wider">
                  List Price
                </span>
                <span className="font-body text-sm font-bold text-ni-rust">
                  {price !== undefined ? (price === 0 ? 'Not Available' : `${formatINR(computeListPrice(price))}/kg`) : 'Price on request'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-ni-secondary">
                  {product.weights.join(' · ')}
                </span>
                <span className="font-mono text-xs text-ni-muted">
                  {product.sku}
                </span>
              </div>
              <p className="font-body text-[11px] text-ni-muted mt-1 uppercase tracking-wider">
                {product.mesh}
              </p>
            </div>
          </>
        ) : (
          /* Homepage Card layout */
          <>
            {/* Category tag */}
            <span className={`inline-block text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-md w-max mb-2.5 border cat-badge-${product.category}`}>
              {product.category}
            </span>

            {/* Product name */}
            <h3 className="font-heading text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
              {product.name}
            </h3>

            {/* Tagline / Description */}
            <p className="font-body text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2 line-clamp-2">
              {product.tagline}. {product.description}
            </p>

            <div className="mt-auto pt-4" />
          </>
        )}

        {!showDescription ? (
          /* Homepage action — Add to Sample Box */
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
            className={`w-full font-body text-[10px] font-bold uppercase tracking-widest py-3 transition-all duration-300 rounded-full active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
              inBasket
                ? 'bg-ni-surface2 text-ni-primary hover:bg-ni-border'
                : 'bg-ni-rust text-white hover:bg-ni-rust-lt hover:shadow-hover hover:-translate-y-0.5'
            }`}
          >
            {inBasket ? '✓ In Sample Box' : 'Add to Sample Box'}
          </button>
        ) : (
          /* Catalog actions — Add to Sample Box */
          <div className="flex flex-col gap-2 mt-auto">
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
              className={`w-full font-body text-[10px] font-bold uppercase tracking-widest py-2.5 transition-all duration-300 rounded-full active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
                inBasket
                  ? 'bg-ni-surface2 text-ni-primary hover:bg-ni-border'
                  : 'bg-transparent border border-ni-rust text-ni-rust hover:bg-ni-rust hover:text-white hover:-translate-y-0.5'
              }`}
            >
              {inBasket ? '✓ In Sample Box' : 'Add to Sample Box'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
