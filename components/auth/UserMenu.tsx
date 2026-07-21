'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [dropdownOpen])

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = user.user_metadata?.full_name || user.email || 'User'
  const isAdmin = !!user.user_metadata?.is_admin

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust rounded-full p-1 cursor-pointer transition-all duration-300"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-8 h-8 rounded-full border border-ni-border2"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-ni-rust text-white flex items-center justify-center font-bold text-xs uppercase border border-ni-border2">
            {fullName.charAt(0)}
          </div>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-ni-surface border border-ni-border shadow-lg py-1 z-50 animate-fade-in origin-top-right">
          <div className="px-4 py-2 border-b border-ni-border text-xs text-ni-muted truncate">
            {fullName}
          </div>

          <Link
            href="/account"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-sm text-ni-secondary hover:bg-ni-rust-bg hover:text-ni-rust transition-colors duration-200"
          >
            My Orders
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-ni-secondary hover:bg-ni-rust-bg hover:text-ni-rust font-semibold transition-colors duration-200"
            >
              Admin Portal
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
