'use client'

import React, { useState } from 'react'
import { useScrollReveal } from '../../lib/hooks'

type FAQItem = { question: string; answer: string }

const faqs: FAQItem[] = [
  {
    question: 'What is a single-ingredient Nectar Ingredients powder?',
    answer: `A Nectar Ingredients powder is a pure, single-source dehydrated powder. Unlike multi-ingredient mixtures, each powder has nothing added — no fillers, no preservatives, and no flow agents — just 100% pure dehydrated vegetable, fruit, or spice.`,
  },
  {
    question: 'What order quantities do you support?',
    answer: `We ship 1 kg samples for trialling a new ingredient right up to 25 kg commercial bags and 500 kg bulk lots. Contact us with your monthly requirement and we'll confirm availability and pricing within one business day.`,
  },
  {
    question: 'Where are Nectar Ingredients powders manufactured?',
    answer: `Every powder is processed, quality-tested, and packaged at our dedicated facility in Surendranagar, Gujarat. We source raw agricultural material directly from farms to guarantee field-to-powder purity.`,
  },
  {
    question: 'How do I search your product range?',
    answer: `Use our live search bar on the Products page. You can type full names or partial terms — "tomato", "turmeric", "nectar in" — and the catalog filters instantly without a page reload.`,
  },
  {
    question: 'Do you provide batch certificates and lab reports?',
    answer: `Yes. Batch certificates covering moisture, colour (Hunter Lab), and mesh fineness are available on request for every order. Custom third-party testing can be arranged for larger commercial contracts.`,
  },
]

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { ref, visible } = useScrollReveal()

  const toggle = (idx: number) => setActiveIndex(activeIndex === idx ? null : idx)

  return (
    <section className="py-[var(--space-section)] bg-transparent border-t border-ni-border/10">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-4 sm:px-6 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-ni-rust mb-4">
            FAQ
          </p>
          <h2
            className="font-heading font-bold text-ni-primary tracking-[-0.02em]"
            style={{ fontSize: 'var(--text-h2)' }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="font-body text-ni-secondary mt-4 leading-relaxed"
            style={{ fontSize: 'var(--text-base)' }}
          >
            Answers to common questions about our products, sourcing, and ordering.
          </p>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-ni-border/20">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx
            return (
              <div key={idx} className="group">
                <button
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust
                             focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg"
                >
                  <span
                    className="font-heading font-bold text-ni-primary group-hover:text-ni-rust transition-colors duration-200"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    {faq.question}
                  </span>

                  {/* Animated chevron */}
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                                border border-ni-border/40 text-ni-muted
                                group-hover:border-ni-rust group-hover:text-ni-rust
                                transition-all duration-300
                                ${isOpen ? 'bg-ni-rust border-ni-rust !text-white rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 4l4 4 4-4" />
                    </svg>
                  </span>
                </button>

                {/* Answer panel — grid-template-rows trick: no height JS, no CLS */}
                <div
                  className="grid transition-all duration-300"
                  style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transitionTimingFunction: 'var(--ease-out-expo)',
                  }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="font-body text-ni-secondary leading-[1.7] pb-5"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
