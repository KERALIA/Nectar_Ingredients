'use client'

import React from 'react'
import Link from 'next/link'
import { useScrollReveal } from '../../lib/hooks'

export default function B2BOverviewSection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="py-20 sm:py-24 bg-ni-surface2/40 dark:bg-white/[0.01] border-t border-b border-ni-border/15 relative overflow-hidden">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-3xl mb-12">
          <span className="font-body text-xs font-extrabold uppercase tracking-widest text-ni-rust block mb-2">
            Commercial Supply & Manufacturing
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-ni-primary tracking-tight leading-tight">
            Premium Food Ingredients Supplier & Dehydration Facility
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-body text-base text-ni-secondary leading-relaxed">
          <div className="p-6 sm:p-8 rounded-[24px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card">
            <h3 className="font-heading text-lg font-bold text-ni-primary mb-3">
              Bulk Dehydrated Powders
            </h3>
            <p>
              As a premier <strong className="text-ni-primary">food ingredients supplier</strong> and direct manufacturer operating out of Surendranagar, Gujarat, <strong className="text-ni-primary">Nectar Ingredients</strong> specializes in high-purity dehydrated vegetable powders, fruit powders, and spice powders. Our commercial catalog includes premium spray-dried and air-dried tomato powder, pink onion powder, white onion powder, garlic powder, ginger powder, and specialized culinary herbs engineered for seamless B2B integration.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-[24px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card">
            <h3 className="font-heading text-lg font-bold text-ni-primary mb-3">
              Clean Label & Mesh Precision
            </h3>
            <p>
              Engineered specifically for commercial food processors, snack seasoning blenders, cloud kitchens, and nutraceutical formulators, every ingredient run is processed under strict low-temperature drying protocols. We offer precise 80–100 mesh particle sizing with zero fillers, zero anti-caking agents, and zero artificial preservatives, guaranteeing clean-label compliance and authentic flavor retention across every production batch.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-[24px] bg-ni-surface/90 dark:bg-[#1A1A1D]/90 border border-ni-border/30 dark:border-white/10 shadow-card">
            <h3 className="font-heading text-lg font-bold text-ni-primary mb-3">
              Flexible Order Quantities
            </h3>
            <p>
              Whether you require 1 kg trial sample boxes for R&D testing or multi-metric-ton bulk shipments for commercial dispatches, our Surendranagar processing plant delivers direct factory pricing with full batch origin traceability. Learn more about our manufacturing standards or contact our technical sales team to request custom formulations tailored to your processing specs.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-body text-xs font-extrabold uppercase tracking-wider text-ni-rust hover:text-ni-rust-lt transition-colors"
          >
            <span>Explore Commercial Products Range</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
