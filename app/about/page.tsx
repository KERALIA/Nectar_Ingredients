import Button from '../../components/ui/Button'
import Image from 'next/image'

export const metadata = { title: 'About — Nectar Ingredients' }

export default function AboutPage() {
  return (
    <div className="pt-16 bg-ni-bg min-h-screen">

      {/* Section 1 — Story: two column */}
      <section className="border-b border-ni-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — text */}
          <div>
            <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">OUR STORY</p>
            <h1 className="font-heading text-display font-semibold text-ni-primary leading-tight">
              We've been making powders since before it was trendy.
            </h1>
            <div className="mt-8 space-y-5">
              <p className="font-body text-base text-ni-muted leading-relaxed">
                Nectar Ingredients started in 2011 as a small dehydration unit in Surendranagar, Gujarat.
                Our first customers were local spice merchants and regional packaged food brands who needed
                consistent, clean-label raw materials. Back then, "clean label" wasn't a marketing term — it
                was just how we worked.
              </p>
              <p className="font-body text-base text-ni-muted leading-relaxed">
                Today we supply ready-to-eat manufacturers, cloud kitchens, nutraceutical companies, and
                specialty grocery importers across India. The client list has grown. The process hasn't.
                Every batch still starts with raw produce, not concentrate or reconstituted material.
              </p>
              <p className="font-body text-base text-ni-muted leading-relaxed">
                If a batch doesn't meet our moisture, color, and aroma specifications, it doesn't ship.
                That's not a policy — it's just the only way we know how to do this.
              </p>
            </div>
            <div className="mt-10">
              <Button variant="outline" size="md" href="/contact">Work with us →</Button>
            </div>
          </div>

          {/* Right — Facility photo */}
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <Image
              src="/Images/Facility_Photo.jpg"
              alt="Nectar Ingredients manufacturing facility, Ankleshwar Gujarat"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

        </div>
      </section>

      {/* Section 2 — Values: 3 column grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-body text-xs tracking-widest text-ni-rust uppercase mb-4">HOW WE WORK</p>
          <h2 className="font-heading text-section font-semibold text-ni-primary mb-16">Three things we don't compromise on.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ni-border">

            <div className="bg-ni-bg p-8">
              <h3 className="font-heading text-xl font-semibold text-ni-primary mb-3">Single-ingredient only</h3>
              <p className="font-body text-sm text-ni-muted leading-relaxed">
                We never blend, add carriers, or fortify unless the client explicitly specifies it.
                What it says on the bag is what's in the bag.
              </p>
            </div>

            <div className="bg-ni-bg p-8">
              <h3 className="font-heading text-xl font-semibold text-ni-primary mb-3">Batch traceability</h3>
              <p className="font-body text-sm text-ni-muted leading-relaxed">
                Every bag ships with a batch code that's traceable to the source farm, harvest date,
                and drying run. We keep records for 3 years.
              </p>
            </div>

            <div className="bg-ni-bg p-8">
              <h3 className="font-heading text-xl font-semibold text-ni-primary mb-3">Direct from facility</h3>
              <p className="font-body text-sm text-ni-muted leading-relaxed">
                No brokers, no middlemen. We manufacture, quality-check, pack, and dispatch from
                one location in Surendranagar. You're always talking to the people who made it.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}