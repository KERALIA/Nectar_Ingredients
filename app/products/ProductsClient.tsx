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

// ── Sample box discovery banner ─────────────────────────────────────────────
function SampleBoxBanner() {
  const { totalItems } = useSampleBasket()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Once items exist, the floating badge takes over
  if (mounted && totalItems > 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                    glass-panel-premium border-l-4 border-l-ni-rust p-6 mb-10 shadow-premium rounded-[24px] transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-ni-rust/10 text-ni-rust flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h4 className="font-heading font-bold text-ni-primary text-base">Build your custom 1 kg Sample Box</h4>
          <p className="font-body text-xs text-ni-secondary mt-0.5 leading-relaxed">
            Select any number of single-ingredient powders and dispatch 1 kg commercial trial samples directly to your R&D lab or kitchen.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        href="/contact"
        className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 rounded-full border-ni-rust text-ni-rust hover:bg-ni-rust hover:text-white"
      >
        How Sample Box Works →
      </Button>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ni-rust/10 border border-ni-rust/20 text-ni-rust font-body text-[10px] font-extrabold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-ni-rust animate-pulse" />
            <span>Official Product Catalog</span>
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
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              '100% Single-Ingredient',
              '0% Additives or Fillers',
              'FSSAI & ISO Quality Standard',
              '80-100 Mesh Fine Grind Options',
            ].map((badge) => (
              <span
                key={badge}
                className="font-body text-[11px] font-semibold text-ni-primary bg-ni-surface/80 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-ni-border/20 shadow-sm"
              >
                ✓ {badge}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/NECTAR_BROCHURE.pdf"
              download
              className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-white bg-ni-rust hover:bg-ni-rust-lt px-6 py-3.5 rounded-full shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Full Brochure (PDF)
            </a>

            <Button
              variant="outline"
              size="md"
              href="/contact"
              className="rounded-full border-ni-border text-ni-primary hover:border-ni-rust hover:text-ni-rust"
            >
              Request Custom Formulation →
            </Button>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Top-of-Page Quick Navigation Menu / Table of Contents */}
        <nav aria-label="Quick Product Index" className="mb-10 p-6 rounded-[24px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-ni-border/20">
            <div>
              <h2 className="font-heading text-base font-extrabold text-ni-primary">
                Quick Product Index ({products.length} Ingredients)
              </h2>
              <p className="font-body text-xs text-ni-secondary mt-0.5">
                Click any powder to jump directly to its wholesale specifications, mesh size, and B2B pricing details.
              </p>
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-ni-rust bg-ni-rust/10 px-3 py-1 rounded-full border border-ni-rust/20">
              Direct Anchor Jump
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
                className="font-body text-xs font-semibold px-3 py-1.5 rounded-full bg-ni-surface2/60 dark:bg-white/[0.04] text-ni-primary border border-ni-border/20 hover:border-ni-rust hover:text-ni-rust hover:bg-ni-rust/10 transition-all flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.swatchHex || '#BC4B20' }} />
                <span>{p.name}</span>
              </a>
            ))}
          </div>
        </nav>

        <SampleBoxBanner />

        <ProductGrid
          showFilter={true}
          showDescription={true}
          highlightedSlug={highlightedSlug}
          prices={initialPrices}
          user={user}
        />

        {/* ── Extended Dehydrated Range Section ── */}
        <section className="mt-28 pt-16 border-t border-ni-border/20">
          <SectionHeading
            tag="Custom & Bulk Orders"
            heading="Extended Dehydrated Catalog"
            sub="Beyond our core 40 powders, we manufacture custom dehydrated flakes, granules, chopped cuts, and specialized botanical ingredients on demand."
          />
          
          {/* Chatbot Inquiry Instruction Notice */}
          <div className="mt-6 mb-4 p-4 sm:p-5 rounded-2xl border border-ni-rust/30 bg-ni-rust/10 dark:bg-ni-rust/15 backdrop-blur-md flex items-start sm:items-center gap-3.5 shadow-sm max-w-4xl mx-auto">
            <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">💬</span>
            <p className="font-body text-xs sm:text-sm font-medium text-ni-primary leading-relaxed">
              <strong className="font-bold text-ni-rust">Inquiry Notice:</strong> To send an inquiry or request custom cuts for these extended items, please chat directly with our <strong className="font-bold text-ni-rust underline underline-offset-2">AI Chatbot</strong> (bottom-right widget). The standard sample cart form above only processes the core listed product cards above.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {extendedItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-5 rounded-[20px]
                           border border-ni-border/20 bg-ni-surface/80 dark:bg-[#1A1A1D]/80 backdrop-blur-md
                           hover:shadow-card hover:-translate-y-1 hover:border-ni-rust/30
                           transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-ni-rust flex-shrink-0 group-hover:scale-125 transition-transform" aria-hidden="true" />
                  <span className="font-body text-sm font-bold text-ni-primary group-hover:text-ni-rust transition-colors">{item.name}</span>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ni-muted
                                 bg-ni-surface2/60 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-ni-border/10">
                  {item.forms}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="ghost" size="md" href="/contact" className="rounded-full text-ni-rust hover:bg-ni-rust/10">
              Inquire About Custom Cuts & Bulk Rates →
            </Button>
          </div>
        </section>

        {/* ── Certificates of Analysis (COA) Hub Section ── */}
        <CertificatesSection />
      </div>
    </div>
  )
}
