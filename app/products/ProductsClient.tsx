'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGrid from '../../components/products/ProductGrid'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { extendedRange, products } from '../../lib/data'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { useSearch } from '../../context/SearchContext'
import { useDebounce } from '../../lib/hooks'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import CertificatesSection from '@/components/products/CertificatesSection'

// ── Order Cart discovery banner with real-time tracker ─────────────────────
function SampleBoxBanner() {
  const { totalItems } = useSampleBasket()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  // Active progress meter when powders are selected
  if (totalItems > 0) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                      border border-ni-border/30 bg-ni-surface p-6 mb-10 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
              <h4 className="font-heading font-bold text-ni-primary text-base">
                Cart: {totalItems} Ingredient{totalItems !== 1 ? 's' : ''} Selected
              </h4>
            </div>
            <p className="font-body text-xs sm:text-sm text-ni-secondary mt-1 leading-relaxed">
              1 kg commercial trial samples and bulk drum dispatches. Batch verified for moisture and color. Dispatches within 24 to 48 hours.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-sample-basket'))
            }
          }}
          className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 rounded-xl bg-ni-rust text-white font-body text-xs sm:text-sm font-semibold hover:bg-ni-rust-lt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust"
        >
          Review Cart &amp; Checkout
        </button>
      </div>
    )
  }

  // Initial discovery banner
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                    border border-ni-border/30 bg-ni-surface p-6 mb-10 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-ni-rust/10 text-ni-rust flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h4 className="font-heading font-bold text-ni-primary text-base">Order 1 kg Trial Packs or Bulk Drums</h4>
          <p className="font-body text-xs sm:text-sm text-ni-secondary mt-1 leading-relaxed">
            Select any single-ingredient powders and add them directly to your cart for lab evaluation or commercial manufacturing.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-sample-basket'))
          }
        }}
        className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 rounded-xl border border-ni-rust text-ni-rust hover:bg-ni-rust hover:text-white font-body text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust"
      >
        View Cart
      </button>
    </div>
  )
}

// ── Main client component ────────────────────────────────────────────────────
interface ProductsClientProps {
  initialPrices?: Record<string, number>
}

export default function ProductsClient({ initialPrices = {} }: ProductsClientProps) {
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const { searchTerm, setSearchTerm } = useSearch()
  const supabase = createClient()

  // Debounce search
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    setMounted(true)

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync search term from URL param
  useEffect(() => {
    const query = searchParams.get('search')
    if (query) setSearchTerm(query)
  }, [searchParams, setSearchTerm])

  // Scroll-highlight & smooth scroll handling
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      if (!hash) return

      const slug = decodeURIComponent(hash.replace(/^#(product-)?/, ''))
      if (slug) {
        setSearchTerm('')
        setHighlightedSlug(slug)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('popstate', handleHash)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('popstate', handleHash)
    }
  }, [setSearchTerm])

  // Scroll to element whenever highlightedSlug updates
  useEffect(() => {
    if (!highlightedSlug) return
    const slug = highlightedSlug

    const scrollTimer = setTimeout(() => {
      const el = document.getElementById(slug) || document.getElementById(`product-${slug}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)

    const clearTimer = setTimeout(() => {
      setHighlightedSlug(null)
    }, 3000)

    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(clearTimer)
    }
  }, [highlightedSlug])

  const extendedItems = useMemo(() => extendedRange, [])

  return (
    <div className="pt-24 bg-ni-bg min-h-screen">

      {/* ── Page Header Section ── */}
      <div className="border-b border-ni-border/20 relative overflow-hidden bg-gradient-to-b from-ni-surface2/30 via-transparent to-transparent">
        <div
          className="absolute right-0 top-0 w-[60%] h-full pointer-events-none -z-10 opacity-70"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 100% 0%, var(--glow-color-strong) 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ni-surface border border-ni-border/30 text-ni-rust font-body text-xs font-medium mb-6">
            <span>Official product catalog</span>
          </div>

          <h1
            className="font-heading font-black text-ni-primary tracking-tight max-w-3xl leading-tight"
            style={{ fontSize: 'var(--text-h1)' }}
          >
            {products.length} Pure Dehydrated Food Powders
          </h1>

          <p className="font-body text-ni-secondary mt-4 max-w-2xl leading-relaxed text-base sm:text-lg">
            Manufactured in Surendranagar, Gujarat. Supplied in 1 kg samples up to 25 kg commercial bags. Every batch lab-tested for moisture, mesh size, and color integrity.
          </p>

          {/* Key Value Badges */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            {[
              '100% Single-Ingredient',
              '0% Additives or Fillers',
              'FSSAI & ISO Quality Standard',
              '80 to 100 Mesh Fine Grind Options',
            ].map((badge) => (
              <span
                key={badge}
                className="font-body text-xs text-ni-primary bg-ni-surface px-3 py-1.5 rounded-lg border border-ni-border/30 shadow-xs"
              >
                ✓ {badge}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/NECTAR_BROCHURE.pdf"
              download
              className="inline-flex items-center gap-2 font-body text-xs sm:text-sm font-semibold text-white bg-ni-rust hover:bg-ni-rust-lt px-5 py-3 rounded-xl transition-colors duration-200"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download Full Brochure (PDF)</span>
            </a>

            <Button
              variant="outline"
              size="md"
              href="/contact"
              className="rounded-xl border-ni-border/40 text-ni-primary hover:border-ni-rust hover:text-ni-rust"
            >
              Request Custom Formulation
            </Button>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        <SampleBoxBanner />

        <ProductGrid
          showFilter={true}
          showDescription={true}
          highlightedSlug={highlightedSlug}
          prices={initialPrices}
          user={user}
        />

        {/* Quick Navigation Index — shown AFTER all 40 cards so users can jump back up */}
        <nav aria-label="Quick Product Index" className="mt-16 p-6 rounded-2xl bg-ni-surface border border-ni-border/30 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-ni-border/20">
            <div>
              <h2 className="font-heading text-base font-bold text-ni-primary">
                Quick Product Index ({products.length} Ingredients)
              </h2>
              <p className="font-body text-xs text-ni-secondary mt-0.5">
                Select any powder to jump directly to its specifications, mesh size, and commercial details.
              </p>
            </div>
            <span className="hidden sm:inline-block font-body text-xs font-medium text-ni-rust bg-ni-rust/10 px-2.5 py-0.5 rounded-md border border-ni-rust/20">
              Direct index jump
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {products.map((p) => (
              <a
                key={p.id}
                href={`#${p.slug}`}
                onClick={(e) => {
                  e.preventDefault()
                  setSearchTerm('')
                  setHighlightedSlug(p.slug)

                  if (window.location.hash !== `#${p.slug}`) {
                    window.history.pushState(null, '', `#${p.slug}`)
                    window.dispatchEvent(new Event('hashchange'))
                  } else {
                    setTimeout(() => {
                      const el = document.getElementById(p.slug) || document.getElementById(`product-${p.slug}`)
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }, 100)
                  }
                }}
                className="font-body text-xs font-medium px-3 py-1.5 rounded-lg bg-ni-bg text-ni-primary border border-ni-border/20 hover:border-ni-rust hover:text-ni-rust transition-colors flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.swatchHex || 'var(--rust)' }} />
                <span>{p.name}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* ── Extended Dehydrated Range Section ── */}
        <section className="mt-24 pt-16 border-t border-ni-border/20">
          <SectionHeading
            tag="Custom and bulk orders"
            heading="Extended Dehydrated Catalog"
            sub="Beyond our core 40 powders, we manufacture custom dehydrated flakes, granules, chopped cuts, and specialized botanical ingredients on demand."
          />

          {/* Inquiry Instruction Notice */}
          <div className="mt-8 mb-6 p-5 sm:p-6 rounded-xl border border-ni-border/30 bg-ni-surface flex items-start sm:items-center gap-4 shadow-sm max-w-4xl mx-auto">
            <div className="w-9 h-9 rounded-lg bg-ni-rust/10 flex items-center justify-center text-ni-rust flex-shrink-0" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-body text-xs sm:text-sm text-ni-secondary leading-relaxed">
              <strong className="font-semibold text-ni-primary">Inquiry Notice:</strong> To send an inquiry or request custom cuts for these extended items, use our chat assistant (bottom-right widget) or contact page. The standard sample cart above processes our 40 core listed powders.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {extendedItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-5 rounded-xl
                           border border-ni-border/30 bg-ni-surface
                           hover:border-ni-rust/40 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" aria-hidden="true" />
                  <span className="font-body text-sm font-semibold text-ni-primary group-hover:text-ni-rust transition-colors">{item.name}</span>
                </div>
                <span className="font-mono text-xs text-ni-muted bg-ni-bg px-2.5 py-1 rounded border border-ni-border/20">
                  {item.forms}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="ghost" size="lg" href="/contact" className="rounded-xl text-ni-rust hover:bg-ni-rust/10 text-sm font-semibold">
              Inquire About Custom Cuts &amp; Bulk Rates
            </Button>
          </div>
        </section>

        {/* ── Certificates of Analysis (COA) Hub Section ── */}
        <CertificatesSection />
      </div>
    </div>
  )
}
