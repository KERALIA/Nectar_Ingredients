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
          className={`font-body text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 border transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust
            ${active === opt.value
              ? 'border-ni-rust bg-ni-rust text-white shadow-sm'
              : 'border-ni-border2 text-ni-muted hover:border-ni-rust hover:text-ni-rust'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}