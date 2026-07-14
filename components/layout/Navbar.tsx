'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useSearch } from '../../context/SearchContext'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { searchTerm, setSearchTerm, isSearchOpen, setIsSearchOpen } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value && pathname !== '/products') {
      router.push('/products')
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--surface-glass)] backdrop-blur-xl border-b border-ni-border/30 shadow-premium'
            : 'bg-transparent'
        }`}
        // Support iPhone notch / Dynamic Island
        style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg flex items-center flex-shrink-0"
          >
            <span className="font-heading font-bold text-ni-primary text-xl">Nectar</span>
            <span className="text-ni-primary font-heading font-light mx-1 text-xl opacity-70">|</span>
            <span className="font-heading font-normal text-ni-primary text-xl">Ingredients</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body text-sm font-medium px-4 py-1.5 transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
                  pathname === link.href
                    ? 'bg-ni-surface2 text-ni-primary'
                    : 'text-ni-secondary hover:text-ni-primary hover:bg-ni-surface2/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions — Search, Theme toggle & CTA (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative flex items-center">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-ni-secondary hover:text-ni-primary p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust rounded-full transition-colors"
                aria-label="Toggle search input"
                aria-expanded={isSearchOpen}
              >
                <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <input
                ref={inputRef}
                type="search"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search powders..."
                className={`transition-all duration-300 ease-in-out bg-ni-surface2 border border-ni-border2/30 rounded-full text-xs text-ni-primary placeholder:text-ni-muted focus:outline-none focus:ring-2 focus:ring-ni-rust ${
                  isSearchOpen ? 'w-48 px-4 py-1.5 ml-1 opacity-100' : 'w-0 p-0 border-0 opacity-0 pointer-events-none'
                }`}
              />
            </div>
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              href="/contact"
              className="text-[10px] px-5 py-2 font-bold uppercase tracking-wider rounded-full shadow-card hover:shadow-hover"
            >
              Get Samples
            </Button>
          </div>

          {/* Mobile hamburger — 44×44px touch target */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden text-ni-secondary p-3 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg rounded-full"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6 stroke-current transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer — slide-down with iOS safe-area bottom padding */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-ni-surface border-b border-ni-border/30 shadow-premium px-4 sm:px-6 py-6 flex flex-col max-h-[calc(100svh-4rem)] overflow-y-auto transition-all duration-300 ease-out ${
          mobileOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Mobile Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ni-muted text-sm pointer-events-none" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search powders..."
            className="w-full bg-ni-surface2 border border-ni-border2/30 pl-10 pr-4 py-3 font-body text-sm text-ni-primary placeholder:text-ni-muted focus:outline-none focus:ring-2 focus:ring-ni-rust rounded-full"
            aria-label="Search products"
            // font-size 16px set in globals to prevent iOS zoom; this style is a fallback
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Nav links — large touch targets for mobile */}
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-4 border-b border-ni-border/10 font-body text-xs font-bold uppercase tracking-[0.15em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust ${
                pathname === link.href
                  ? 'text-ni-rust'
                  : 'text-ni-secondary hover:text-ni-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>

        <Button
          variant="primary"
          size="sm"
          href="/contact"
          className="mt-6 w-full justify-center rounded-full py-4 text-sm"
        >
          Get Samples →
        </Button>
      </div>
    </>
  )
}