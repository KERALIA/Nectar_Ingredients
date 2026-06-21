import React from 'react'

interface SectionHeadingProps {
  tag?: string
  heading: string
  sub?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  tag,
  heading,
  sub,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {tag && (
        <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">
          {tag}
        </p>
      )}
      <h2 className="font-heading text-section font-semibold text-ni-primary">
        {heading}
      </h2>
      {sub && (
        <p
          className={`font-body text-base text-ni-secondary mt-4 max-w-2xl${align === 'center' ? ' mx-auto' : ''}`}
        >
          {sub}
        </p>
      )}
    </div>
  )
}