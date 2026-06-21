import React from 'react'
import Link from 'next/link'

const COMPANY_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Request Sample', href: '/contact' },
]

const CATEGORIES = [
  'Vegetable Powders',
  'Fruit Powders',
  'Spice Powders',
  'Bulk Orders',
]

export default function Footer() {
  return (
    <footer className="bg-ni-surface border-t border-ni-border">
      {/* Row 1 — columns */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1 — Brand */}
        <div>
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg"
          >
            <span className="font-heading font-semibold text-ni-primary text-lg">
              Nectar
            </span>
            <span className="text-ni-border2 mx-2 font-body font-light">|</span>
            <span className="font-body font-normal text-ni-muted text-sm">
              Ingredients
            </span>
          </Link>
          <p className="font-body text-sm text-ni-muted mt-4 max-w-xs leading-relaxed">
            Pure dehydrated powders from Surendranagar, Gujarat.
            Single-ingredient, batch-tested, direct from facility.
          </p>
          <p className="font-body text-sm text-ni-rust mt-3">
            hello@nectaringredients.com
          </p>
        </div>

        {/* Column 2 — Company links */}
        <div>
          <p className="font-body text-xs tracking-widest text-ni-muted uppercase mb-4">
            Company
          </p>
          {COMPANY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block font-body text-sm text-ni-secondary hover:text-ni-primary py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Column 3 — Categories (decorative, no links) */}
        <div>
          <p className="font-body text-xs tracking-widest text-ni-muted uppercase mb-4">
            Categories
          </p>
          {CATEGORIES.map((category) => (
            <span
              key={category}
              className="block font-body text-sm text-ni-secondary py-1"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — bottom bar */}
      <div className="border-t border-ni-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-xs text-ni-muted">
            © {new Date().getFullYear()} Nectar Ingredients Pvt. Ltd.
          </p>
          <p className="font-body text-xs text-ni-muted">
            Made in Surendranagar 🇮🇳 · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}