'use client'

import React, { useState } from 'react'
import Button from '../ui/Button'

interface CertificateItem {
  id: string
  title: string
  category: 'core' | 'vegetables' | 'dairy-colors' | 'botanicals'
  categoryLabel: string
  filename: string
  date: string
  fileSize: string
  highlight?: boolean
  description: string
}

const CERTIFICATES: CertificateItem[] = [
  {
    id: 'all-report',
    title: 'Master Batch Quality & Lab Analysis Portfolio',
    category: 'core',
    categoryLabel: 'Full Catalog Master',
    filename: 'ALL REPORT.pdf',
    date: 'Official Master Document',
    fileSize: '4.9 MB',
    highlight: true,
    description: 'Comprehensive multi-parameter lab analysis report covering heavy metals, moisture, mesh fineness, and micro-biology across all core powders.',
  },
  {
    id: 'tomato-coa',
    title: 'Tomato Powder Certificate of Analysis (COA)',
    category: 'vegetables',
    categoryLabel: 'Dehydrated Vegetables',
    filename: 'tomato powder 12-8-2024.pdf',
    date: 'Aug 2024 Certified',
    fileSize: '685 KB',
    highlight: true,
    description: 'Official test report validating 80-mesh particle sizing, lycopene content, zero artificial dyes, and moisture below 6%.',
  },
  {
    id: 'beetroot-coa',
    title: 'Beetroot Powder Certificate of Analysis & Lab Test',
    category: 'vegetables',
    categoryLabel: 'Dehydrated Vegetables',
    filename: 'Beetroot Powder coa.pdf',
    date: 'Quality Certified',
    fileSize: '471 KB',
    highlight: true,
    description: 'Analytical report certifying betalain pigment preservation, cold-processing standards, and absence of synthetic additives.',
  },
  {
    id: 'cheese-coa',
    title: 'Cheese Powder Grade A Technical Specification COA',
    category: 'dairy-colors',
    categoryLabel: 'Dairy Powders',
    filename: 'Cheese Powder-A- COA.pdf',
    date: 'Dairy Grade Report',
    fileSize: '284 KB',
    highlight: true,
    description: 'Dairy lab report confirming fat percentage, moisture stability, and microbiological safety for savory snack seasonings.',
  },
  {
    id: 'caramel-coa',
    title: 'Liquid Caramel Color Technical Analysis Report',
    category: 'dairy-colors',
    categoryLabel: 'Natural Colors',
    filename: 'LIQUID CARAMEL.pdf',
    date: 'Color Class Test',
    fileSize: '530 KB',
    description: 'Color intensity and specific gravity test certificate for beverage and culinary sauce formulations.',
  },
  {
    id: 'sounth-coa',
    title: 'Sounth (Ginger) Powder Certificate of Analysis',
    category: 'vegetables',
    categoryLabel: 'Spices & Botanicals',
    filename: 'SOUNTH.pdf',
    date: 'Batch Verified',
    fileSize: '554 KB',
    description: 'Assay confirming active gingerol retention, volatile oil percentage, and 80-mesh powder consistency.',
  },
  {
    id: 'kokum-coa',
    title: 'Kokum Dehydrated Powder Lab Analysis',
    category: 'botanicals',
    categoryLabel: 'Dehydrated Fruits',
    filename: 'KOKUM.pdf',
    date: 'Batch Verified',
    fileSize: '544 KB',
    description: 'Garcinia indica acid content certificate for authentic culinary souring applications.',
  },
  {
    id: 'ajwain-coa',
    title: 'Ajwain Seed Powder Technical Test Report',
    category: 'botanicals',
    categoryLabel: 'Spices & Botanicals',
    filename: 'AJOWAIN.pdf',
    date: 'Batch Verified',
    fileSize: '553 KB',
    description: 'Thymol essential oil retention and purity test certificate for spice seasonings.',
  },
  {
    id: 'mulethi-coa',
    title: 'Mulethi (Licorice) Powder Lab Certificate',
    category: 'botanicals',
    categoryLabel: 'Botanical Extracts',
    filename: 'MULETHI.pdf',
    date: 'Batch Verified',
    fileSize: '544 KB',
    description: 'Glycyrrhizin content assay and ash analysis report for nutraceutical formulations.',
  },
  {
    id: 'senna-coa',
    title: 'Senna Leaf Powder Quality Certificate',
    category: 'botanicals',
    categoryLabel: 'Botanical Extracts',
    filename: 'SENNA.pdf',
    date: 'Batch Verified',
    fileSize: '555 KB',
    description: 'Sennoside assay purity certificate for herbal tea and health supplement manufacturers.',
  },
  {
    id: 'himej-coa',
    title: 'Himej Powder Certificate of Analysis',
    category: 'botanicals',
    categoryLabel: 'Botanical Extracts',
    filename: 'HIMEJ.pdf',
    date: 'Batch Verified',
    fileSize: '553 KB',
    description: 'Terminalia chebula tannin profile and moisture test report.',
  },
  {
    id: 'vidang-coa',
    title: 'Vidang Powder Lab Analysis Report',
    category: 'botanicals',
    categoryLabel: 'Botanical Extracts',
    filename: 'VIDANG.pdf',
    date: 'Batch Verified',
    fileSize: '554 KB',
    description: 'Embelia ribes active marker test and micro-biological safety certificate.',
  },
  {
    id: 'nishoth-coa',
    title: 'Nishoth Powder Laboratory Test Report',
    category: 'botanicals',
    categoryLabel: 'Botanical Extracts',
    filename: 'NISHOTH.pdf',
    date: 'Batch Verified',
    fileSize: '555 KB',
    description: 'Operculina turpethum resin content and heavy metal analysis report.',
  },
  {
    id: 'white-nasotar-coa',
    title: 'White Nasotar Powder Certificate of Analysis',
    category: 'botanicals',
    categoryLabel: 'Botanical Extracts',
    filename: 'WHITE NASOTAR.pdf',
    date: 'Batch Verified',
    fileSize: '554 KB',
    description: 'High-purity botanical extract assay report for pharma and wellness formulators.',
  },
]

type CategoryFilter = 'all' | 'core' | 'vegetables' | 'dairy-colors' | 'botanicals'

export default function CertificatesSection() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')

  const filteredCerts = activeFilter === 'all'
    ? CERTIFICATES
    : CERTIFICATES.filter(c => c.category === activeFilter)

  return (
    <section id="certificates-section" className="py-20 sm:py-28 bg-ni-surface2/30 dark:bg-white/[0.01] border-t border-ni-border/20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 right-0 w-[50%] h-[70%] pointer-events-none opacity-30 -z-10"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 100% 0%, var(--glow-color-strong) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ni-surface border border-ni-border/30 text-ni-rust font-body text-xs font-medium mb-4">
              <span>Official Compliance Vault</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ni-primary tracking-tight leading-tight">
              Certificates of Analysis (COA) &amp; Lab Test Reports
            </h2>

            <p className="font-body text-ni-secondary text-base sm:text-lg mt-3 leading-relaxed">
              Every production batch from our Surendranagar plant is independently lab-tested for moisture, mesh particle size, heavy metals, and microbiological purity. Download verified PDF certificates below.
            </p>
          </div>

          <a
            href="/Certificates_of_ananalysis/ALL REPORT.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 font-body text-xs sm:text-sm font-semibold text-white bg-ni-rust hover:bg-ni-rust-lt px-6 py-3.5 rounded-xl shadow-sm transition-colors duration-200 whitespace-nowrap self-start lg:self-end"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download All-in-One Master Report (PDF)</span>
          </a>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-ni-border/15">
          {[
            { id: 'all', label: 'All Documents (14)' },
            { id: 'core', label: 'Master Portfolio' },
            { id: 'vegetables', label: 'Vegetables & Spices' },
            { id: 'dairy-colors', label: 'Dairy & Colors' },
            { id: 'botanicals', label: 'Botanicals & Extracts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as CategoryFilter)}
              className={`px-4 py-2 rounded-lg font-body text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
                activeFilter === tab.id
                  ? 'bg-ni-rust text-white border-ni-rust shadow-xs'
                  : 'bg-ni-surface text-ni-secondary border-ni-border/30 hover:border-ni-rust hover:text-ni-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className={`p-6 sm:p-7 rounded-2xl border transition-colors duration-200 flex flex-col justify-between group relative overflow-hidden ${
                cert.highlight
                  ? 'bg-ni-surface border-ni-rust/50 shadow-md'
                  : 'bg-ni-surface border-ni-border/30 hover:border-ni-rust/40 shadow-sm'
              }`}
            >
              {/* Card Header: Category Badge + PDF Tag */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-md border border-ni-rust/30 bg-ni-rust/10 text-ni-rust">
                    {cert.categoryLabel}
                  </span>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-ni-muted bg-ni-surface2 px-2.5 py-1 rounded-md border border-ni-border/20">
                    <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span>{cert.fileSize}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-heading text-lg font-bold text-ni-primary group-hover:text-ni-rust transition-colors duration-200 leading-snug">
                  {cert.title}
                </h3>

                {/* Description */}
                <p className="font-body text-xs sm:text-sm text-ni-secondary mt-2 leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-3 border-t border-ni-border/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-ni-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{cert.date}</span>
                </div>

                <a
                  href={`/Certificates_of_ananalysis/${encodeURIComponent(cert.filename)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-semibold text-ni-rust hover:text-ni-rust-lt transition-colors"
                >
                  View PDF
                </a>
              </div>

            </div>
          ))}
        </div>

        {/* Custom COA Request Footer Bar */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-ni-border/30 bg-ni-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ni-rust" />
              <h4 className="font-heading text-lg font-bold text-ni-primary">Need a lot-specific custom lab COA or heavy metals test?</h4>
            </div>
            <p className="font-body text-xs sm:text-sm text-ni-secondary leading-relaxed">
              Our quality assurance lab issues customized batch reports (microbiology, moisture, HPLC curcumin assay) for commercial food formulators upon order placement.
            </p>
          </div>

          <Button variant="primary" size="lg" href="/contact" className="rounded-xl px-6 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm font-semibold">
            Request Custom Lot COA
          </Button>
        </div>

      </div>
    </section>
  )
}
