import React from 'react'

interface TagProps {
  children: React.ReactNode
  className?: string
}

export default function Tag({ children, className = '' }: TagProps) {
  return (
    <span
      className={`font-body text-xs font-medium tracking-wide uppercase border border-ni-border2 text-ni-muted px-2.5 py-0.5 rounded-none${className ? ` ${className}` : ''}`}
    >
      {children}
    </span>
  )
}