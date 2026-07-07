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
    <div className="flex items-center justify-between gap-4 bg-ni-rust-bg border border-ni-rust-dim px-5 py-3.5 mb-8">
      <div className="flex items-center gap-3">
        <span className="text-ni-rust text-lg" aria-hidden="true">✦</span>
        <p className="font-body text-sm text-ni-secondary">
          <span className="font-medium text-ni-primary">Build your sample box.</span>{' '}
          Add up to any number of powders and send one inquiry — we'll dispatch 1 kg samples of each.
        </p>
      </div>
      <Button variant="outline" size="sm" href="/contact" className="flex-shrink-0">
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
    <div className="pt-16 bg-ni-bg min-h-screen">

      {/* Page header */}
      <div className="border-b border-ni-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">OUR POWDERS</p>
          <h1 className="font-heading text-display font-semibold text-ni-primary">
            {products.length} single-ingredient powders
          </h1>
          <p className="font-body text-base text-ni-secondary mt-4 max-w-2xl leading-relaxed">
            Manufactured in Surendranagar. Available from 1 kg samples to 25 kg commercial bags.
            All batches tested for moisture, colour, and mesh fineness.
          </p>
          {/* Brochure download */}
          <div className="mt-6">
            <a
              href="/NECTAR_BROCHURE.pdf"
              download
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-ni-rust hover:text-ni-rust-lt border border-ni-rust hover:bg-ni-rust hover:text-white px-5 py-2.5 transition-all duration-200"
            >
              Download Full Brochure (PDF) ↓
            </a>
          </div>
        </div>
      </div>

      {/* Product grid with filter */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* Fix #4: Sample Box discovery banner */}
        <SampleBoxBanner />

        <ProductGrid showFilter={true} showDescription={true} highlightedSlug={highlightedSlug} />

        {/* Extended dehydrated range */}
        <section className="mt-24 pt-16 border-t border-ni-border">
          <SectionHeading
            tag="ALSO AVAILABLE"
            heading="Extended dehydrated range"
            sub="Beyond our featured powders, we manufacture additional dehydrated vegetables, herbs, and specialty ingredients on request. Contact us for pricing and MOQ."
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
            {extendedRange.map((item) => (
              <div key={item.name} className="flex items-baseline gap-2 py-2 border-b border-ni-border">
                <span className="w-1.5 h-1.5 rounded-full bg-ni-rust flex-shrink-0" />
                <span className="font-body text-sm font-medium text-ni-primary">{item.name}</span>
                <span className="font-body text-xs text-ni-muted ml-auto">{item.forms}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost" size="md" href="/contact">Inquire About These Products →</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
