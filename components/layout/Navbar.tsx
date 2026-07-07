'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-sm border-b border-ni-border'
            : 'bg-transparent'
        }`}
        style={scrolled ? { backgroundColor: 'rgba(var(--bg-rgb), 0.95)' } : undefined}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-body text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg ${
                  pathname === link.href
                    ? 'text-ni-rust'
                    : 'text-ni-secondary hover:text-ni-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Theme toggle — desktop */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button variant="outline" size="sm" href="/contact">
              Get Samples →
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden font-body text-ni-secondary p-3 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
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
 
      {/* Mobile drawer with slide-down & fade animation */}
      <div 
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-ni-surface border-b border-ni-border px-6 py-6 flex flex-col max-h-[80vh] overflow-y-auto transition-all duration-300 ease-out ${
          mobileOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block py-4 border-b border-ni-border font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg ${
              pathname === link.href
                ? 'text-ni-rust'
                : 'text-ni-secondary hover:text-ni-primary'
            }`}
          >
            {link.label}
          </Link>
        ))}
        {/* Theme toggle — mobile */}
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          size="sm"
          href="/contact"
          className="mt-6 w-full justify-center"
        >
          Get Samples →
        </Button>
      </div>
    </>
  )
}