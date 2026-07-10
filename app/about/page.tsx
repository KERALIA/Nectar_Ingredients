import Button from '../../components/ui/Button'
import Image from 'next/image'

export const metadata = { title: 'About — Nectar Ingredients' }

export default function AboutPage() {
  return (
    <div className="pt-16 bg-ni-bg min-h-screen overflow-x-hidden">

      {/* Section 1 — Story: two column */}
      <section className="border-b border-ni-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left — text */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">OUR STORY</p>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mt-2 mb-4">
              Your success is our business
            </p>
            <h1 className="font-heading text-display font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
              We've been making powders since before it was trendy.
            </h1>
            <div className="mt-8 space-y-5">
              <p className="font-body text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Nectar Ingredients started in 2011 as a small dehydration unit in Surendranagar, Gujarat.
                Our first customers were local spice merchants and regional packaged food brands who needed
                consistent, clean-label raw materials. Back then, "clean label" wasn't a marketing term — it
                was just how we worked.
              </p>
              <p className="font-body text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Today we supply ready-to-eat manufacturers, cloud kitchens, nutraceutical companies, and
                specialty grocery importers across India. The client list has grown. The process hasn't.
                Every batch still starts with raw produce, not concentrate or reconstituted material.
              </p>
              <p className="font-body text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                If a batch doesn't meet our moisture, color, and aroma specifications, it doesn't ship.
                That's not a policy — it's just the only way we know how to do this.
              </p>
            </div>
            <div className="mt-10">
              <Button variant="outline" size="md" href="/contact">Work with us →</Button>
            </div>
          </div>

          {/* Right — Facility photo */}
          <div className="relative w-full overflow-hidden rounded-[24px] border border-ni-border/50" style={{ aspectRatio: '4/3' }}>
            <Image
              src="/Images/Facility_Photo.jpg"
              alt="Nectar Ingredients manufacturing facility, Ankleshwar Gujarat"
              fill
              className="object-cover object-center transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

        </div>
      </section>

      {/* Section 2 — Values: 3 column grid */}
      <section className="py-24 border-b border-ni-border/10 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">HOW WE WORK</p>
          <h2 className="font-heading text-section font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-12">Three things we don't compromise on.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="glass-panel p-8 rounded-[24px] hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ni-rust" />
                Single-ingredient only
              </h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                We never blend, add carriers, or fortify unless the client explicitly specifies it.
                What it says on the bag is what's in the bag.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-[24px] hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ni-rust" />
                Batch traceability
              </h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Every bag ships with a batch code that's traceable to the source farm, harvest date,
                and drying run. We keep records for 3 years.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-[24px] hover:shadow-hover hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ni-rust" />
                Direct from facility
              </h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                No brokers, no middlemen. We manufacture, quality-check, pack, and dispatch from
                one location in Surendranagar. You're always talking to the people who made it.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3 — Bottom CTA: prevents the "dead end" UX problem */}
      <section className="py-24 bg-transparent border-b border-ni-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — message */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-[#C05621] mb-4">WORK WITH US</p>
            <h2 className="font-heading text-section font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Ready to source from us?
            </h2>
            <p className="font-body text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mt-4 max-w-md">
              Browse our full range of 24 single-ingredient powders, request 1 kg samples,
              or send us your spec sheet — we respond within one business day.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button variant="primary" size="md" href="/products" className="rounded-full">Browse All Powders →</Button>
              <Button variant="ghost" size="md" href="/contact" className="rounded-full">Send an Inquiry</Button>
            </div>
          </div>

          {/* Right — quick credential stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { value: '24',   label: 'Products available' },
              { value: '1 kg', label: 'Minimum sample size' },
              { value: '2 MT', label: 'Monthly capacity' },
              { value: '2011', label: 'Year established' },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className="bg-ni-surface border border-ni-border/10 p-8 rounded-[24px] shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <p className="font-heading text-3xl font-extrabold tracking-tight text-ni-rust">{stat.value}</p>
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-ni-muted mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}