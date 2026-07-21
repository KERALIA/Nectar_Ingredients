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
    <footer className="bg-gradient-to-b from-ni-bg via-ni-surface/50 to-ni-surface border-t border-ni-border/10 relative overflow-hidden shadow-premium">
      {/* Row 1 — columns */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1 — Brand */}
        <div>
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg flex items-center"
          >
            <span className="font-heading font-bold text-ni-primary text-xl tracking-tight">
              Nectar
            </span>
            <span className="text-ni-muted/50 mx-2 font-light">|</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-ni-muted">
              Ingredients
            </span>
          </Link>
          <p className="font-body text-sm text-ni-muted mt-4 max-w-xs leading-relaxed">
            Pure dehydrated powders from Surendranagar, Gujarat.
            Single-ingredient, batch-tested, direct from facility.
          </p>
          <a
            href="mailto:nectaringredients@gmail.com"
            className="font-body text-sm text-ni-rust hover:text-ni-rust-lt transition-colors mt-3 block"
          >
            nectaringredients@gmail.com
          </a>
          <a
            href="tel:+919879838281"
            className="font-body text-sm text-ni-secondary hover:text-ni-rust transition-colors mt-1 block"
          >
            +91 98798 38281
          </a>
        </div>

        {/* Column 2 — Company links */}
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-ni-muted mb-4">
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
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-ni-muted mb-4">
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
      <div className="border-t border-ni-border/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-ni-muted">
            © {new Date().getFullYear()} Nectar Ingredients Pvt. Ltd.
          </p>
          <div className="flex gap-4 text-xs font-body text-ni-muted">
            <Link href="/privacy" className="hover:text-ni-rust transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ni-rust">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-ni-rust transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ni-rust">
              Terms of Service
            </Link>
          </div>
          <p className="font-body text-xs text-ni-muted">
            Made in Surendranagar 🇮🇳 · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}