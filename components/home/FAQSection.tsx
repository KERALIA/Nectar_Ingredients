'use client'

import React, { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: 'What is a single-ingredient nectaringredient powder?',
      answer: 'A nectaringredient refers to a pure, single-source dehydrated powder made by Nectaringredients. Unlike multi-ingredient mixtures, each nectaringredient has nothing added—no fillers, no preservatives, and no flow agents—just 100% pure dehydrated vegetable, fruit, or spice.',
    },
    {
      question: 'How do I search for products using progressive terms like nectar in, nectar ing, or nectar ingr?',
      answer: 'When using our autocomplete product search bar, you can type shorthand terms like "nectar in", "nectar ing", "nectar ingr", or even partial variations like "nectaringre" or "nectaringred" to instantly filter our inventory. Our search is optimized to map progressive user keystrokes to exact products immediately.',
    },
    {
      question: 'Where are Nectaringredients powders manufactured?',
      answer: 'Every single nectaringredient is processed, quality-tested, and packaged at our dedicated facility in Surendranagar, Gujarat. We source raw agricultural materials directly from farms to guarantee field-to-powder purity.',
    },
  ]

  const toggle = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx)
  }

  return (
    <section className="py-24 bg-transparent border-t border-ni-border/10">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">FAQ</p>
          <h2 className="font-heading text-section font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Frequently Asked Questions
          </h2>
          <p className="font-body text-base text-neutral-600 dark:text-neutral-300 mt-4">
            Answers to common questions about Nectaringredients products, sourcing, and search features.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx
            return (
              <div
                key={idx}
                className="glass-panel rounded-[20px] overflow-hidden transition-all duration-300 border border-ni-border/10"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between text-left focus:outline-none group"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 transition-colors group-hover:text-ni-rust">
                    {faq.question}
                  </span>
                  <span className="ml-4 flex-shrink-0 w-6 h-6 rounded-full bg-ni-rust/10 flex items-center justify-center text-ni-rust group-hover:bg-ni-rust group-hover:text-white transition-all duration-300">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-6 sm:px-8 sm:pb-8 font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-ni-border/5 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
