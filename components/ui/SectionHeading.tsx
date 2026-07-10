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
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">
          {tag}
        </p>
      )}
      <h2 className="font-heading text-section font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
        {heading}
      </h2>
      {sub && (
        <p
          className={`font-body text-base text-neutral-600 dark:text-neutral-300 mt-4 max-w-2xl${align === 'center' ? ' mx-auto' : ''} leading-relaxed`}
        >
          {sub}
        </p>
      )}
    </div>
  )
}