'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { useScrollReveal } from '../../lib/hooks'

interface IndustryVertical {
  id: string
  title: string
  subtitle: string
  tag: string
  ingredients: string[]
  applications: string[]
  advantage: string
}

const VERTICALS: IndustryVertical[] = [
  {
    id: 'snack-seasoning',
    title: 'Snack Seasonings & Extruded Foods',
    subtitle: 'High-dispersion 80 to 100 mesh powders engineered for even surface adhesion and zero seasoning clumping.',
    tag: 'Snacks & Seasoning',
    ingredients: ['White and Pink Onion Powder', 'Garlic Powder (100 mesh)', 'Spray-Dried Tomato Powder', 'Cheese Powder'],
    applications: ['Potato Chips & Wafers', 'Extruded Corn Snacks', 'Roasted Makhana & Nuts', 'Noodle Tastemaker Sachets'],
    advantage: 'Instant dispersion with high surface-binding affinity under commercial oil-spray tumbler systems.',
  },
  {
    id: 'soups-sauces',
    title: 'Instant Soups, Sauces & Curries',
    subtitle: 'Concentrated natural umami and thermal-stable pigments for ready-to-cook premixes.',
    tag: 'Premixes & Gravies',
    ingredients: ['Tomato Powder (High Lycopene)', 'Ginger Powder (High Gingerol)', 'Green Chilly Powder', 'Tamarind Powder'],
    applications: ['Dehydrated Soup Premixes', 'Ready-to-Cook Curry Paste', 'Pasta & Pizza Sauce Bases', 'Gravy Concentrates'],
    advantage: 'Thermal color and aroma stability across high-temperature retort and pasteurization cycles.',
  },
  {
    id: 'nutraceuticals',
    title: 'Nutraceuticals & Functional Foods',
    subtitle: 'Cold-processed botanical powders retaining bio-active curcuminoids, betalains, and natural vitamin C.',
    tag: 'Wellness & Nutrition',
    ingredients: ['Turmeric Powder (Min 3% Curcumin)', 'Beetroot Powder (Betalain rich)', 'Amla Powder (Vitamin C)', 'Jamun Powder'],
    applications: ['Dietary Supplements', 'Sports Nutrition Blends', 'Functional Wellness Drinks', 'Botanical Extract Formulations'],
    advantage: 'Processed at strictly controlled low temperatures to maximize active phytonutrient retention.',
  },
  {
    id: 'bakery-dairy',
    title: 'Bakery, Confectionery & Dairy',
    subtitle: 'Authentic fruit pulps and dairy bases spray-dried without synthetic additives or artificial colors.',
    tag: 'Bakery & Dairy',
    ingredients: ['Alphonso Mango Powder', 'Strawberry Powder', 'Spray-Dried Coconut Milk Powder', 'Cream & Curd Powders'],
    applications: ['Cake & Muffin Premixes', 'Fruit-Filled Chocolates', 'Ice Cream & Frozen Desserts', 'Dairy-Free Smoothies'],
    advantage: 'Pure raw fruit flavor profile with zero artificial sugars, carriers, or synthetic dyes.',
  },
]

const PACKAGING_SPECS = [
  {
    tier: 'R&D Trial Scale',
    capacity: '1 kg sample box',
    packaging: 'Triple-layer vacuum-sealed aluminium foil pouches',
    useCase: 'Benchtop formulation testing, sensory evaluation, and pilot batch validation.',
  },
  {
    tier: 'Commercial Bulk Dispatches',
    capacity: '25 kg commercial bags',
    packaging: 'Double poly-lined moisture barrier HDPE bags and corrugated cartons',
    useCase: 'High-speed automated packaging lines and bulk seasoning blenders.',
  },
  {
    tier: 'Wholesale & Export Logistics',
    capacity: 'Multi-metric ton container dispatches',
    packaging: 'Palletized, shrink-wrapped containers with Certificate of Analysis (CoA)',
    useCase: 'Commercial food processors, institutional kitchen chains, and specialty importers.',
  },
]

function CategoryIcon({ id }: { id: string }) {
  if (id === 'snack-seasoning') {
    return (
      <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
  if (id === 'soups-sauces') {
    return (
      <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }
  if (id === 'nutraceuticals') {
    return (
      <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  )
}

function PackagingIcon({ idx }: { idx: number }) {
  if (idx === 0) {
    return (
      <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }
  if (idx === 1) {
    return (
      <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h16" />
    </svg>
  )
}

export default function B2BIndustrySolutions() {
  const { ref, visible } = useScrollReveal()
  const [activeTab, setActiveTab] = useState(VERTICALS[0].id)

  const activeVertical = VERTICALS.find((v) => v.id === activeTab) || VERTICALS[0]

  /* ponytail: Tab-based formulation matrix. Move to full dynamic ingredient binder when recipes expand past 4 verticals. */
  return (
    <section className="py-16 sm:py-24 bg-ni-surface relative border-t border-b border-ni-border/20" aria-label="B2B industry applications">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity transition-transform duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="font-body text-xs font-medium text-ni-rust mb-3">
            Industry Formulations
          </p>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ni-primary tracking-tight leading-[1.15]">
            Engineered for Commercial Food Processing
          </h2>

          <p className="font-body text-ni-secondary text-base sm:text-lg mt-3 leading-relaxed font-normal">
            Whether for high-speed snack seasoning tumblers, instant curry bases, or nutraceutical blends, our 80 to 100 mesh powders deliver consistent batch-to-batch solubility and color.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-ni-border/20">
          {VERTICALS.map((v) => {
            const isActive = v.id === activeTab
            return (
              <button
                key={v.id}
                onClick={() => setActiveTab(v.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-body text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-ni-rust text-white border-ni-rust'
                    : 'bg-ni-bg text-ni-secondary border-ni-border/30 hover:text-ni-primary hover:border-ni-border'
                }`}
              >
                <CategoryIcon id={v.id} />
                <span>{v.title}</span>
              </button>
            )
          })}
        </div>

        {/* Active Vertical Architectural Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 rounded-2xl bg-ni-bg border border-ni-border/30">
          {/* Left Column: Overview and Advantage */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <span className="font-body text-xs text-ni-rust px-2.5 py-1 rounded bg-ni-surface border border-ni-border/30 inline-block mb-4">
                {activeVertical.tag}
              </span>

              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-ni-primary leading-tight">
                {activeVertical.title}
              </h3>

              <p className="font-body text-sm sm:text-base text-ni-secondary mt-3 leading-relaxed">
                {activeVertical.subtitle}
              </p>

              {/* Technical Processing Advantage */}
              <div className="mt-6 p-5 rounded-xl bg-ni-surface border border-ni-border/30">
                <p className="text-xs font-semibold text-ni-primary mb-1">
                  Processing advantage:
                </p>
                <p className="font-body text-xs sm:text-sm text-ni-secondary leading-relaxed">
                  {activeVertical.advantage}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="md" href="/products" className="rounded-lg text-xs sm:text-sm px-5 py-2.5">
                View Ingredients
              </Button>
              <Button variant="outline" size="md" href="/contact" className="rounded-lg border-ni-border/40 text-ni-primary hover:border-ni-rust text-xs sm:text-sm px-5 py-2.5">
                Request Custom Formulation
              </Button>
            </div>
          </div>

          {/* Right Column: Ingredients & Applications */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="p-5 sm:p-6 rounded-xl bg-ni-surface border border-ni-border/30">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-ni-primary mb-3">
                Recommended Ingredients
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-ni-secondary">
                {activeVertical.ingredients.map((ing) => (
                  <li key={ing} className="flex items-center gap-2">
                    <span className="text-ni-rust font-bold">·</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 sm:p-6 rounded-xl bg-ni-surface border border-ni-border/30">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-ni-primary mb-3">
                Commercial End-Products
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeVertical.applications.map((app) => (
                  <span
                    key={app}
                    className="font-body text-xs text-ni-secondary bg-ni-bg px-2.5 py-1 rounded border border-ni-border/20"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Packaging & Bulk Dispatch */}
        <div className="mt-16 pt-12 border-t border-ni-border/20">
          <div className="max-w-2xl mb-8">
            <p className="font-body text-xs font-medium text-ni-rust mb-2">
              Logistics &amp; Supply Specifications
            </p>
            <h3 className="font-heading text-2xl font-bold text-ni-primary tracking-tight">
              Packaging Options from Trial Pouches to Multiton Lots
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGING_SPECS.map((pkg, idx) => (
              <div
                key={pkg.tier}
                className="p-6 rounded-xl bg-ni-bg border border-ni-border/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-ni-rust/10 flex items-center justify-center">
                      <PackagingIcon idx={idx} />
                    </div>
                    <span className="text-xs text-ni-rust px-2.5 py-0.5 rounded bg-ni-surface border border-ni-border/30 font-medium">
                      {pkg.capacity}
                    </span>
                  </div>

                  <h4 className="font-heading text-base font-bold text-ni-primary mb-1">
                    {pkg.tier}
                  </h4>

                  <p className="font-body text-xs text-ni-rust mb-2 font-medium">
                    {pkg.packaging}
                  </p>

                  <p className="font-body text-xs text-ni-secondary leading-relaxed">
                    {pkg.useCase}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-ni-border/20 flex items-center justify-between text-xs text-ni-muted">
                  <span>Surendranagar dispatch</span>
                  <span className="text-ni-primary font-medium">Moisture-sealed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
