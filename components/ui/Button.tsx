'use client'

import React from 'react'
import Link from 'next/link'

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-sm px-6 py-3',
  lg: 'text-base px-8 py-4',
}

const variantClasses: Record<'primary' | 'ghost' | 'outline', string> = {
  primary:
    'bg-ni-rust hover:bg-ni-rust-lt text-white hover:shadow-hover hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg',
  ghost:
    'bg-transparent border border-ni-border2 text-ni-secondary hover:border-ni-secondary hover:text-ni-primary hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg',
  outline:
    'bg-transparent border border-ni-rust text-ni-rust hover:bg-ni-rust hover:text-white hover:shadow-hover hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust focus-visible:ring-offset-2 focus-visible:ring-offset-ni-bg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-full font-body font-bold uppercase tracking-widest text-[11px] transition-all duration-300 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}