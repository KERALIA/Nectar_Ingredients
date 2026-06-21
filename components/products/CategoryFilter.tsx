'use client'

type Category = 'all' | 'vegetable' | 'fruit' | 'spice'

interface CategoryFilterProps {
  active: Category
  onChange: (c: Category) => void
}

const options: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Vegetables', value: 'vegetable' },
  { label: 'Fruits', value: 'fruit' },
  { label: 'Spices', value: 'spice' },
]

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`font-body text-xs font-medium tracking-wide uppercase px-4 py-2 border transition-all duration-200 rounded-none
            ${active === opt.value
              ? 'border-ni-rust bg-ni-rust text-white'
              : 'border-ni-border2 text-ni-muted hover:border-ni-rust hover:text-ni-rust'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}