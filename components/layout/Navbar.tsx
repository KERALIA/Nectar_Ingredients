'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useSearch } from '../../context/SearchContext'
import { useSampleBasket } from '../../context/SampleBasketContext'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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
  const { totalItems } = useSampleBasket()
  const inputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcut (⌘K or Ctrl+K) for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsSearchOpen])

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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-3 sm:px-6 ${
          scrolled ? 'py-2' : 'py-3 sm:py-4'
        }`}
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        }}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-500 backdrop-blur-2xl border ${
            scrolled
              ? 'bg-white/95 dark:bg-[#141416]/95 border-neutral-200/80 dark:border-white/15 shadow-2xl py-2 px-4 sm:px-6'
              : 'bg-white/95 dark:bg-[#141416]/95 border-neutral-200/80 dark:border-white/15 shadow-xl py-2.5 px-4 sm:px-6'
          }`}
        >
          <div className="flex items-center justify-between h-11 relative">
            
            {/* Official Nectar Logo Image + Brand Mark */}
            <Link
              href="/"
              className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC4B20] focus-visible:ring-offset-2 rounded-full flex-shrink-0"
              aria-label="Nectar Ingredients Home"
            >
              <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/Nectar_Logo.png"
                  alt="Nectar Ingredients Official Logo"
                  width={32}
                  height={32}
                  className="object-contain w-8 h-8 transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-baseline gap-1 font-heading text-lg font-extrabold tracking-tight leading-none">
                  <span className="text-neutral-900 dark:text-white">Nectar</span>
                  <span className="text-[#BC4B20] font-black">.</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-base">Ingredients</span>
                </div>
                <span className="hidden sm:block font-body text-[8.5px] font-black tracking-[0.22em] uppercase text-[#BC4B20] mt-0.5">
                  Pure Dehydrated Powders
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links — Uncompressed, spacious layout */}
            <nav className="hidden md:flex items-center gap-1 bg-neutral-100/90 dark:bg-white/[0.08] px-2 py-1 rounded-full border border-neutral-200/80 dark:border-white/10 shadow-inner">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-body text-xs font-black tracking-wide px-4 py-1.5 transition-all duration-200 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC4B20] ${
                      isActive
                        ? 'bg-[#BC4B20] text-white shadow-sm font-black'
                        : 'text-neutral-900 dark:text-neutral-100 hover:text-[#BC4B20] hover:bg-neutral-200/70 dark:hover:bg-white/15'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right Action Bar (Search Icon + Expandable Input, Sample Basket, Theme Toggle & CTA) */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* OG Search Bar & Expandable Input */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-neutral-900 dark:text-white hover:text-[#BC4B20] hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC4B20]"
                  aria-label="Toggle search bar"
                  title="Search powders (⌘K)"
                >
                  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Inline Expandable Search Bar */}
                <div
                  className={`transition-all duration-300 overflow-hidden flex items-center ${
                    isSearchOpen ? 'w-48 sm:w-56 ml-1 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search 40 powders..."
                    className="w-full bg-neutral-100 dark:bg-[#202024] border border-neutral-300 dark:border-white/15 rounded-full text-xs px-3.5 py-1.5 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#BC4B20]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Sample Box Counter Chip */}
              {mounted && totalItems > 0 && (
                <Link
                  href="/contact"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#BC4B20]/10 dark:bg-[#BC4B20]/20 border border-[#BC4B20]/40 text-[#BC4B20] font-body text-xs font-black transition-transform duration-300 hover:scale-105"
                  title="View Sample Box"
                >
                  <svg className="w-3.5 h-3.5 text-[#BC4B20]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{totalItems} {totalItems === 1 ? 'Sample' : 'Samples'}</span>
                </Link>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Adjust Get Samples CTA Pill — Perfectly proportioned spacing */}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 font-heading text-xs font-extrabold uppercase tracking-wider px-6 py-2.5 rounded-full bg-[#BC4B20] text-white shadow-md hover:bg-[#D45E30] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 whitespace-nowrap"
              >
                <span>GET SAMPLES</span>
                <span className="text-xs font-black">→</span>
              </Link>
            </div>

            {/* Mobile Actions & Hamburger */}
            <div className="md:hidden flex items-center gap-2">
              {mounted && totalItems > 0 && (
                <Link
                  href="/contact"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#BC4B20]/10 text-[#BC4B20] text-xs font-black border border-[#BC4B20]/30"
                >
                  {totalItems}
                </Link>
              )}

              <ThemeToggle />

              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="p-2 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              >
                <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay Drawer */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-x-0 top-[72px] z-40 bg-white/98 dark:bg-[#161618]/98 backdrop-blur-2xl border-b border-neutral-200 dark:border-white/10 p-6 transition-all duration-500 shadow-2xl ${
          mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="max-w-md mx-auto space-y-5">
          {/* Mobile Search Input */}
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search 40 powders..."
              className="w-full bg-neutral-100 dark:bg-[#202024] border border-neutral-300 dark:border-white/15 rounded-full px-4 py-3 font-body text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#BC4B20]"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-2xl font-body text-sm font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#BC4B20] text-white shadow-md'
                      : 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/[0.06] hover:bg-neutral-200'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="opacity-60">→</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile CTA */}
          <Link
            href="/contact"
            className="w-full inline-flex items-center justify-center font-body text-xs font-black uppercase tracking-widest py-4 rounded-full bg-[#BC4B20] text-white shadow-card text-center"
          >
            GET SAMPLES →
          </Link>
        </div>
      </div>
    </>
  )
}