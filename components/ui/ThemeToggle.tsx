'use client'

import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const context = useTheme()
  const theme = context?.theme ?? 'dark'
  const toggleTheme = context?.toggleTheme ?? (() => {})

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />
  }

  const isLight = theme === 'light'

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-10 h-10 flex items-center justify-center text-ni-secondary hover:text-ni-primary hover:bg-ni-surface2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust rounded-full transition-colors cursor-pointer select-none"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Sun Icon (Visible in Dark Mode) */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
          isLight
            ? 'opacity-0 scale-75 rotate-90 pointer-events-none'
            : 'opacity-100 scale-100 rotate-0'
        }`}
      >
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </span>

      {/* Moon Icon (Visible in Light Mode) */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
          isLight
            ? 'opacity-100 scale-100 rotate-0'
            : 'opacity-0 scale-75 -rotate-90 pointer-events-none'
        }`}
      >
        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
    </button>
  )
}