'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { useScrollReveal } from '../../lib/hooks'

interface IndustryVertical {
  id: string
  title: string
  subtitle: string
  icon: string
  tag: string
  bgGradient: string
  accentColor: string
  ingredients: string[]
  applications: string[]
  advantage: string
}

const VERTICALS: IndustryVertical[] = [
  {
    id: 'snack-seasoning',
    title: 'Snack Seasonings & Extruder Foods',
    subtitle: 'High-dispersion 80–100 mesh powders engineered for even surface adhesion and zero seasoning clumping.',
    icon: '🍿',
    tag: 'Snacks & Seasoning',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    accentColor: '#D97706',
    ingredients: ['White / Pink Onion Powder', 'Garlic Powder (100 mesh)', 'Spray-Dried Tomato Powder', 'Cheese Powder'],
    applications: ['Potato Chips & Wafers', 'Extruded Corn Snacks', 'Roasted Makhana & Nuts', 'Noodle Tastemaker Sachets'],
    advantage: 'Instant dispersion with high surface-binding affinity under commercial oil-spray tumbler systems.',
  },
  {
    id: 'soups-sauces',
    title: 'Instant Soups, Sauces & Curries',
    subtitle: 'Concentrated natural umami and thermal-stable pigments for ready-to-cook premixes.',
    icon: '🍲',
    tag: 'Premixes & Gravies',
    bgGradient: 'from-red-500/10 via-rose-500/5 to-transparent',
    accentColor: '#DC2626',
    ingredients: ['Tomato Powder (High Lycopene)', 'Ginger Powder (High Gingerol)', 'Green Chilly Powder', 'Tamarind Powder'],
    applications: ['Dehydrated Soup Premixes', 'Ready-to-Cook Curry Paste', 'Pasta & Pizza Sauce Bases', 'Gravy Concentrates'],
    advantage: 'Thermal color & aroma stability across high-temperature retort and pasteurization cycles.',
  },
  {
    id: 'nutraceuticals',
    title: 'Nutraceuticals & Functional Foods',
    subtitle: 'Cold-processed botanical powders retaining bio-active curcuminoids, betalains, and natural vitamin C.',
    icon: '🌱',
    tag: 'Wellness & Pharma',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    accentColor: '#059669',
    ingredients: ['Turmeric Powder (Min 3% Curcumin)', 'Beetroot Powder (Betalain rich)', 'Amla Powder (Vitamin C)', 'Jamun Powder'],
    applications: ['Dietary Supplements', 'Sports Nutrition Blends', 'Functional Wellness Drinks', 'Botanical Extract Formulations'],
    advantage: 'Processed at strictly controlled low temperatures to maximize active phytonutrient retention.',
  },
  {
    id: 'bakery-dairy',
    title: 'Bakery, Confectionery & Dairy',
    subtitle: 'Authentic fruit pulps and dairy bases spray-dried without synthetic additives or artificial colors.',
    icon: '🥐',
    tag: 'Bakery & Dairy',
    bgGradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
    accentColor: '#DB2777',
    ingredients: ['Alphonso Mango Powder', 'Strawberry Powder', 'Spray-Dried Coconut Milk Powder', 'Cream & Curd Powders'],
    applications: ['Cake & Muffin Premixes', 'Fruit-Filled Chocolates', 'Ice Cream & Frozen Desserts', 'Dairy-Free Smoothies'],
    advantage: 'Pure raw fruit flavor profile with zero artificial sugars, carriers, or synthetic dyes.',
  },
]

const PACKAGING_SPECS = [
  {
    tier: 'R&D Trial Scale',
    capacity: '1 KG Sample Box',
    packaging: 'Triple-Layer Vacuum Sealed Aluminium Foil Pouches',
    useCase: 'Benchtop formulation testing, sensory evaluation & pilot batch runs.',
    icon: '🧪',
  },
  {
    tier: 'Commercial Bulk Dispatches',
    capacity: '25 KG Commercial Bags',
    packaging: 'Double Poly-Lined Moisture Barrier HDPE Bags / Corrugated Boxes',
    useCase: 'High-speed automated factory lines & bulk seasoning blenders.',
    icon: '📦',
  },
  {
    tier: 'Wholesale Export Logistics',
    capacity: 'Multi-Metric Ton Container Dispatches',
    packaging: 'Palletized Shrink-Wrapped Containers with Lot COA Reports',
    useCase: 'Global food processors, cloud kitchen chains & specialty importers.',
    icon: '🚢',
  },
]

export default function B2BIndustrySolutions() {
  const { ref, visible } = useScrollReveal()
  const [activeTab, setActiveTab] = useState(VERTICALS[0].id)

  const activeVertical = VERTICALS.find((v) => v.id === activeTab) || VERTICALS[0]

  return (
    <section className="py-20 sm:py-28 bg-ni-surface relative border-t border-b border-ni-border/15 overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none opacity-20 dark:opacity-10 blur-[120px]"
        style={{ background: `radial-gradient(circle, ${activeVertical.accentColor} 0%, transparent 70%)` }}
      />

      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ── Section Header ── */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ni-rust/10 border border-ni-rust/20 text-ni-rust font-body text-[10px] font-extrabold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-ni-rust animate-pulse" />
            <span>Target B2B Industry Solutions</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ni-primary tracking-tight leading-tight">
            Engineered for Commercial Food Processing & Formulations
          </h2>

          <p className="font-body text-ni-secondary text-base sm:text-lg mt-3 leading-relaxed">
            Whether you operate high-speed snack extruder lines, manufacture instant curry premixes, or formulate functional health supplements — our 80–100 mesh single-ingredient powders deliver consistent batch-to-batch performance.
          </p>
        </div>

        {/* ── Tab Selectors (Mobile Scrollable / Desktop Grid) ── */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-ni-border/15">
          {VERTICALS.map((v) => {
            const isActive = v.id === activeTab
            return (
              <button
                key={v.id}
                onClick={() => setActiveTab(v.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-body text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                  isActive
                    ? 'bg-ni-rust text-white border-ni-rust shadow-md scale-[1.02]'
                    : 'bg-ni-surface2/60 dark:bg-white/[0.04] text-ni-primary border-ni-border/20 hover:border-ni-rust/40 hover:bg-ni-surface2'
                }`}
              >
                <span className="text-base">{v.icon}</span>
                <span>{v.title}</span>
              </button>
            )
          })}
        </div>

        {/* ── Active Vertical Feature Card (Glassmorphic Showcase) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch p-8 sm:p-10 rounded-[32px] glass-panel-premium border border-ni-border/30 dark:border-white/10 shadow-premium relative overflow-hidden transition-all duration-500">
          
          {/* Subtle colored backdrop wash */}
          <div className={`absolute inset-0 bg-gradient-to-br ${activeVertical.bgGradient} opacity-60 pointer-events-none`} />

          {/* Left Column: Vertical Overview & Key Value */}
          <div className="lg:col-span-7 space-y-6 relative z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{activeVertical.icon}</span>
                <span className="font-body text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-ni-border/20 text-ni-primary shadow-sm">
                  {activeVertical.tag}
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-ni-primary leading-tight">
                {activeVertical.title}
              </h3>

              <p className="font-body text-sm sm:text-base text-ni-secondary mt-3 leading-relaxed">
                {activeVertical.subtitle}
              </p>
            </div>

            {/* B2B Technical Advantage Box */}
            <div className="p-5 rounded-2xl bg-white/90 dark:bg-black/60 border border-ni-border/20 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 text-ni-rust font-body text-xs font-bold uppercase tracking-wider mb-1.5">
                <span>✓ Processing Advantage</span>
              </div>
              <p className="font-body text-xs text-ni-primary leading-relaxed">
                {activeVertical.advantage}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="md" href="/products" className="rounded-full shadow-card hover:shadow-hover">
                Explore {activeVertical.title.split(' ')[0]} Ingredients →
              </Button>
              <Button variant="outline" size="md" href="/contact" className="rounded-full border-ni-border text-ni-primary hover:border-ni-rust">
                Request Custom Formulation
              </Button>
            </div>
          </div>

          {/* Right Column: Key Ingredients & Applications Matrix */}
          <div className="lg:col-span-5 space-y-5 relative z-10 flex flex-col justify-between">
            {/* Target Raw Powders List */}
            <div className="p-6 rounded-[24px] bg-white/80 dark:bg-[#18181B]/80 border border-ni-border/20 backdrop-blur-md shadow-card">
              <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-ni-rust mb-3">
                Key Recommended Ingredients
              </h4>
              <ul className="space-y-2">
                {activeVertical.ingredients.map((ing) => (
                  <li key={ing} className="flex items-center gap-2.5 font-body text-xs font-semibold text-ni-primary">
                    <span className="w-2 h-2 rounded-full bg-ni-rust flex-shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application End-Products */}
            <div className="p-6 rounded-[24px] bg-white/80 dark:bg-[#18181B]/80 border border-ni-border/20 backdrop-blur-md shadow-card">
              <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-ni-primary mb-3">
                Common B2B End-Products
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeVertical.applications.map((app) => (
                  <span
                    key={app}
                    className="font-body text-[10px] font-bold text-ni-secondary bg-ni-surface2/70 dark:bg-white/[0.05] px-3 py-1.5 rounded-xl border border-ni-border/10"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Commercial Packaging & Bulk Dispatch Matrix ── */}
        <div className="mt-16 pt-12 border-t border-ni-border/15">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-body text-xs font-extrabold uppercase tracking-widest text-ni-rust block mb-1">
              LOGISTICS & SUPPLY CHAIN SPECS
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-ni-primary">
              Flexible Packaging Built for R&D Benchtop to Factory Lines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGING_SPECS.map((pkg) => (
              <div
                key={pkg.tier}
                className="p-6 rounded-[24px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xl">{pkg.icon}</span>
                    <span className="font-mono text-[10px] font-extrabold text-ni-rust uppercase bg-ni-rust/10 px-2.5 py-1 rounded-full border border-ni-rust/20">
                      {pkg.capacity}
                    </span>
                  </div>

                  <h4 className="font-heading text-base font-bold text-ni-primary mb-2">
                    {pkg.tier}
                  </h4>

                  <p className="font-body text-xs font-semibold text-ni-rust mb-3">
                    {pkg.packaging}
                  </p>

                  <p className="font-body text-xs text-ni-secondary leading-relaxed">
                    {pkg.useCase}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-ni-border/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ni-muted">
                  <span>Surendranagar Plant Dispatch</span>
                  <span>✓ Moisture Sealed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
