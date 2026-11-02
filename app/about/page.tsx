import Button from '../../components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'
import CertificatesSection from '@/components/products/CertificatesSection'

export const metadata = {
  title: 'About Our Story | Nectar Ingredients',
  description: 'Discover the story behind Nectar Ingredients: our single-ingredient dehydration facility in Surendranagar, Gujarat, producing pure food powders for commercial food brands.',
  alternates: {
    canonical: 'https://nectaringredients.vercel.app/about',
  },
}

const DEHYDRATION_STEPS = [
  {
    num: '01',
    title: 'Raw Farm Sourcing',
    desc: 'Direct sourcing of fresh onions, garlic, ginger, and vegetables from local farms in Gujarat. No intermediaries or reconstituted produce.',
  },
  {
    num: '02',
    title: 'Triple-Stage Washing',
    desc: 'Automated high-pressure wash and hygienic slicing to prepare whole ingredients for uniform drying without chemical treatments.',
  },
  {
    num: '03',
    title: 'Low-Temp Dehydration',
    desc: 'Controlled airflow drying that preserves natural essential oils, vibrant natural colors, aroma, and original nutritional profiles.',
  },
  {
    num: '04',
    title: 'Precision Milling & Mesh',
    desc: 'Stainless steel pulverization into fine 80 to 100 mesh powders, sifted and packed immediately in moisture-barrier commercial bags.',
  },
]

function PillarIcon({ idx }: { idx: number }) {
  if (idx === 0) {
    return (
      <svg className="w-6 h-6 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  }
  if (idx === 1) {
    return (
      <svg className="w-6 h-6 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
  return (
    <svg className="w-6 h-6 text-ni-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

const QUALITY_PILLARS = [
  {
    title: '100% Single-Ingredient',
    desc: 'Zero carriers, zero anti-caking agents, zero artificial colors or preservatives. Pure raw food transformed into powder.',
  },
  {
    title: 'Full Batch Traceability',
    desc: 'Every bag bears a unique batch ID linked to raw farm origin, drying run parameters, and lab moisture test reports.',
  },
  {
    title: 'Direct Manufacturing',
    desc: 'Produced, lab-tested, and shipped directly from our plant in Surendranagar, Gujarat. Full accountability guaranteed.',
  },
]

export default function AboutPage() {
  /* ponytail: Core plant story and capabilities. Expand with interactive QA equipment specifications table when lab portal launches. */
  return (
    <div className="pt-24 bg-ni-bg min-h-screen">

      {/* ── Hero & Facility Story Section ── */}
      <section className="relative border-b border-ni-border/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ni-surface border border-ni-border/30 text-ni-rust font-body text-xs font-medium mb-6">
              <span>Established 2021 · Surendranagar, Gujarat</span>
            </div>

            <h1 className="font-heading text-display font-black tracking-tight text-ni-primary leading-tight">
              Precision Dehydration for Commercial Food Brands
            </h1>

            <div className="mt-6 space-y-4 font-body text-base text-ni-secondary leading-relaxed">
              <p>
                <strong className="text-ni-primary">Nectar Ingredients</strong> was built on a simple promise: food manufacturers, spice blenders, cloud kitchens, and snack brands deserve raw material partners who prioritize purity and batch consistency above all else. As a leading <Link href="/" className="text-ni-rust hover:underline font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ni-rust">food ingredients supplier</Link>, we bridge the gap between farm-fresh agricultural produce and industrial food processing.
              </p>
              <p>
                Operating out of our modern plant in Surendranagar, Gujarat, we process raw agricultural produce into clean-label dehydrated powders. Every batch begins with whole fresh produce, never concentrates or pre-processed pastes, to preserve authentic flavor and potency.
              </p>
              <p>
                If a production run fails our moisture thresholds or particle mesh tests, it never leaves our warehouse. That commitment has made us a trusted supplier to food processors across India.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="md" href="/contact" className="rounded-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust">
                Work With Us
              </Button>
              <Button variant="outline" size="md" href="/products" className="rounded-xl border-ni-border/40 text-ni-primary hover:border-ni-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust">
                Browse Products
              </Button>
            </div>
          </div>

          {/* Right Column: Facility Media Container */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-ni-border/30 group" style={{ aspectRatio: '4/3' }}>
            <Image
              src="/Images/Facility_Photo.jpg"
              alt="Nectar Ingredients modern dehydration and manufacturing facility in Surendranagar, Gujarat"
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="px-3.5 py-2 rounded-lg border border-white/20 bg-black/60 text-white backdrop-blur-sm">
                <p className="font-body text-xs font-semibold">Dehydration Facility</p>
                <p className="font-body text-[11px] text-white/80">Surendranagar, Gujarat, India</p>
              </div>

              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 border border-amber-300/30 bg-black/60 backdrop-blur-sm">
                FSSAI Certified Unit
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Dehydration Process Matrix ── */}
      <section className="py-16 sm:py-24 border-b border-ni-border/20 bg-ni-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="font-body text-xs font-medium text-ni-rust mb-2">
              Processing workflow
            </p>
            <h2 className="font-heading text-section font-bold tracking-tight text-ni-primary">
              How We Turn Raw Produce Into Pure Powder
            </h2>
            <p className="font-body text-ni-secondary text-base mt-2">
              A 4-step controlled manufacturing workflow designed to protect natural volatile oils and aroma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEHYDRATION_STEPS.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-xl bg-ni-bg border border-ni-border/30 group"
              >
                <span className="font-heading font-black text-2xl text-ni-rust block mb-3">
                  {step.num}
                </span>
                <h3 className="font-heading text-base font-bold text-ni-primary mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-xs sm:text-sm text-ni-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quality Pillars Section ── */}
      <section className="py-16 sm:py-24 border-b border-ni-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="font-body text-xs font-medium text-ni-rust mb-2">
              Quality standards
            </p>
            <h2 className="font-heading text-section font-bold tracking-tight text-ni-primary">
              Three Core Manufacturing Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {QUALITY_PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="p-7 rounded-xl bg-ni-surface border border-ni-border/30"
              >
                <div className="w-10 h-10 rounded-lg bg-ni-rust/10 flex items-center justify-center mb-4">
                  <PillarIcon idx={idx} />
                </div>
                <h3 className="font-heading text-lg font-bold text-ni-primary mb-2">
                  {pillar.title}
                </h3>
                <p className="font-body text-sm text-ni-secondary leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Official Certificates of Analysis & Lab Reports Hub ── */}
      <CertificatesSection />

      {/* ── Facility Credential Stats ── */}
      <section className="py-16 sm:py-20 border-b border-ni-border/20 bg-ni-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: '40+', label: 'Single-ingredient powders' },
              { value: '1 kg', label: 'Minimum order trial pack' },
              { value: '25 kg', label: 'Commercial bag capacity' },
              { value: '100%', label: 'Natural & single origin' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl bg-ni-bg border border-ni-border/30 text-center"
              >
                <p className="font-heading text-2xl sm:text-3xl font-extrabold text-ni-primary">{stat.value}</p>
                <p className="font-body text-xs text-ni-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ── */}
      <section className="py-16 sm:py-24 bg-ni-bg">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-ni-primary">
            Ready to source clean-label powders?
          </h2>
          <p className="font-body text-ni-secondary text-base mt-3 max-w-xl mx-auto">
            Order 1 kg trial samples to evaluate in your test kitchen or request commercial pricing for bulk dispatches.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="md" href="/contact" className="rounded-xl px-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust">
              Order Commercial Trial
            </Button>
            <Button variant="outline" size="md" href="/products" className="rounded-xl border-ni-border/40 text-ni-primary hover:border-ni-rust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ni-rust">
              Explore 40 Products
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
