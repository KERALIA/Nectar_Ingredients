'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '../../components/products/ProductGrid'
import SectionHeading from '../../components/ui/SectionHeading'
import Button from '../../components/ui/Button'
import { extendedRange, products } from '../../lib/data'
import { useSampleBasket } from '../../context/SampleBasketContext'

// Fix #4: Persistent Sample Box callout so new users discover
// the sampling feature even before they interact with a product card.
function SampleBoxBanner() {
  const { totalItems } = useSampleBasket()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Once there are items, the floating badge takes over — hide the banner
  if (mounted && totalItems > 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel border-l-4 border-l-ni-rust p-5 mb-8 shadow-card rounded-xl">
      <div className="flex items-center gap-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 text-ni-rust flex-shrink-0"
          aria-hidden="true"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <p className="font-body text-sm text-neutral-600 dark:text-neutral-300">
          <span className="font-semibold text-ni-primary">Build your sample box.</span>{' '}
          Add up to any number of powders and send one inquiry — we'll dispatch 1 kg samples of each.
        </p>
      </div>
      <Button variant="outline" size="sm" href="/contact" className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 rounded-full">
        How it works →
      </Button>
    </div>
  )
}

export default function ProductsClient() {
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#product-')) {
      const slug = hash.replace('#product-', '')
      setHighlightedSlug(slug)

      const el = document.getElementById(`product-${slug}`)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }

      setTimeout(() => setHighlightedSlug(null), 2500)
    }
  }, [])

  return (
    <div className="pt-16 bg-ni-bg min-h-screen overflow-x-hidden">

      {/* Page header */}
      <div className="border-b border-ni-border/15 relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute right-0 top-0 w-[50%] h-[100%] pointer-events-none -z-10 bg-gradient-to-l from-ni-rust/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">OUR POWDERS</p>
          <h1 className="font-heading text-display font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            {products.length} single-ingredient powders
          </h1>
          <p className="font-body text-base text-neutral-600 dark:text-neutral-300 mt-4 max-w-2xl leading-relaxed">
            Manufactured in Surendranagar. Available from 1 kg samples to 25 kg commercial bags.
            All batches tested for moisture, colour, and mesh fineness.
          </p>
          {/* Brochure download */}
          <div className="mt-8">
            <a
              href="/NECTAR_BROCHURE.pdf"
              download
              className="inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-[11px] text-ni-rust hover:bg-ni-rust hover:text-white border border-ni-rust px-6 py-3.5 transition-all duration-300 rounded-full hover:shadow-card hover:-translate-y-0.5"
            >
              Download Full Brochure (PDF) ↓
            </a>
          </div>
        </div>
      </div>

      {/* Product grid with filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Fix #4: Sample Box discovery banner */}
        <SampleBoxBanner />

        <ProductGrid showFilter={true} showDescription={true} highlightedSlug={highlightedSlug} />

        {/* Extended dehydrated range */}
        <section className="mt-24 pt-16 border-t border-ni-border/15">
          <SectionHeading
            tag="ALSO AVAILABLE"
            heading="Extended dehydrated range"
            sub="Beyond our featured powders, we manufacture additional dehydrated vegetables, herbs, and specialty ingredients on request. Contact us for pricing and MOQ."
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {extendedRange.map((item) => (
              <div 
                key={item.name} 
                className="flex items-center gap-3 p-4 rounded-xl border border-ni-border/10 bg-ni-surface2/30 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                <span className="font-body text-sm font-bold text-ni-primary">{item.name}</span>
                <span className="font-body text-[9px] font-bold uppercase tracking-widest text-ni-muted ml-auto bg-ni-surface px-2 py-0.5 rounded-md border border-ni-border/10">{item.forms}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="ghost" size="md" href="/contact" className="rounded-full">Inquire About These Products →</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
