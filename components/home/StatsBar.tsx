import { stats } from '../../lib/data'

export default function StatsBar() {
  return (
    <section className="bg-ni-surface border-y border-ni-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ni-border">
          {stats.map(s => (
            <div key={s.label} className="bg-ni-surface flex flex-col items-center justify-center py-10 px-4 text-center">
              <span className="font-heading text-4xl font-semibold text-ni-primary tracking-tight">
                {s.value}
              </span>
              <span className="font-body text-sm text-ni-muted mt-2 tracking-wide">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}