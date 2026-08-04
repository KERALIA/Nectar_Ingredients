'use client'

interface LoadingBufferProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingBuffer({
  size = 'md',
  text,
  className = '',
}: LoadingBufferProps) {
  const dimensions = {
    sm: { outer: 32, inner: 12, stroke: 2.5 },
    md: { outer: 48, inner: 18, stroke: 3 },
    lg: { outer: 72, inner: 28, stroke: 3.5 },
  }[size]

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 select-none ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: dimensions.outer, height: dimensions.outer }}>
        {/* Outer rotating liquid ring */}
        <svg
          className="animate-spin text-ni-rust w-full h-full"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth={dimensions.stroke}
          />
          <path
            d="M25 5C36.0457 5 45 13.9543 45 25C45 30.5 42.8 35.5 39.2 39.1"
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner pulsating powder core */}
        <div
          className="absolute rounded-full bg-ni-rust animate-pulse shadow-[0_0_12px_rgba(188,75,32,0.5)]"
          style={{ width: dimensions.inner, height: dimensions.inner }}
        />
      </div>

      {text && (
        <span className="font-body text-xs font-semibold uppercase tracking-widest text-ni-secondary animate-pulse">
          {text}
        </span>
      )}
    </div>
  )
}
