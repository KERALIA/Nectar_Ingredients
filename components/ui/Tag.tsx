import React from 'react'

interface TagProps {
  children: React.ReactNode
  className?: string
}

export default function Tag({ children, className = '' }: TagProps) {
  return (
    <span
      className={`font-body text-[10px] font-bold tracking-widest uppercase border border-ni-border2 text-ni-muted px-2.5 py-1 rounded-sm${className ? ` ${className}` : ''}`}
    >
      {children}
    </span>
  )
}