'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const context = useTheme()
  const theme = context?.theme ?? 'dark'
  const toggleTheme = context?.toggleTheme ?? (() => {})

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center text-base text-ni-muted hover:text-ni-primary transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}