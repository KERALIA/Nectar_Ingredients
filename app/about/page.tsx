import Button from '../../components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'
import CertificatesSection from '@/components/products/CertificatesSection'

export const metadata = {
  title: 'About Our Story | Nectar Ingredients',
  description: 'Discover the story behind Nectar Ingredients — our modern single-ingredient dehydration facility in Surendranagar, Gujarat, producing pure food powders for food brands.',
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
    desc: 'Controlled air-flow drying that preserves natural essential oils, vibrant natural colors, aroma, and original nutritional profile.',
  },
  {
    num: '04',
    title: 'Precision Milling & Mesh',
    desc: 'Stainless steel pulverization into fine 80–100 mesh powders, sifted and packed immediately in moisture-barrier commercial bags.',
  },
]

const QUALITY_PILLARS = [
  {
    icon: '🌱',
    title: '100% Single-Ingredient',
    desc: 'Zero carriers, zero anti-caking agents, zero artificial colors or preservatives. Pure raw food transformed into powder.',
  },
  {
    icon: '🔍',
    title: 'Full Batch Traceability',
    desc: 'Every bag bears a unique batch ID linked to raw farm origin, drying run parameters, and lab moisture test reports.',
  },
  {
    icon: '🏭',
    title: 'Direct Manufacturing',
    desc: 'Produced, lab-tested, and shipped directly from our plant in Surendranagar, Gujarat. Full accountability guaranteed.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-24 bg-ni-bg min-h-screen">

      {/* ── Hero & Facility Story Section ── */}
      <section className="relative border-b border-ni-border/20 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[50%] h-[70%] pointer-events-none -z-10 opacity-50"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 100% 0%, var(--glow-color-strong) 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column — Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ni-rust/10 border border-ni-rust/20 text-ni-rust font-body text-[10px] font-extrabold uppercase tracking-widest mb-6">
              <span>Established 2021 — Surendranagar, Gujarat</span>
            </div>

            <h1 className="font-heading text-display font-black tracking-tight text-ni-primary leading-tight">
              Precision Dehydration for Commercial Food Brands.
            </h1>

            <div className="mt-6 space-y-4 font-body text-base text-ni-secondary leading-relaxed">
              <p>
                <strong className="text-ni-primary">Nectar Ingredients</strong> was built on a simple promise: food manufacturers, spice blenders, cloud kitchens, and snack brands deserve raw material partners who prioritize purity and batch consistency above all else. As a leading <Link href="/" className="text-ni-rust hover:underline font-semibold">premium food ingredients supplier</Link>, we bridge the gap between farm-fresh agricultural produce and industrial food processing.
              </p>
              <p>
                Operating out of our modern plant in Surendranagar, Gujarat, we process raw agricultural produce into clean-label dehydrated powders. Every batch begins with whole fresh produce — never concentrate or pre-processed paste — to preserve authentic flavor and potency.
              </p>
              <p>
                If a production run fails our strict moisture thresholds or particle mesh tests, it never leaves our warehouse. That commitment has made us a trusted supplier to food processors across India.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="md" href="/contact" className="rounded-full shadow-card hover:shadow-hover">
                Work With Us →
              </Button>
              <Button variant="outline" size="md" href="/products" className="rounded-full border-ni-border text-ni-primary hover:border-ni-rust">
                Browse Products
              </Button>
            </div>
          </div>

          {/* Right Column — Facility Media Container */}
          <div className="relative w-full overflow-hidden rounded-[32px] border border-ni-border/30 dark:border-white/10 group shadow-premium" style={{ aspectRatio: '4/3' }}>
            <Image
              src="/Images/Facility_Photo.jpg"
              alt="Nectar Ingredients modern dehydration and manufacturing facility in Surendranagar, Gujarat"
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md bg-black/40 text-white">
                <p className="font-body text-xs font-bold uppercase tracking-wider">Dehydration Facility</p>
                <p className="font-body text-[10px] text-white/80">Surendranagar, Gujarat, India</p>
              </div>

              <span className="glass-panel px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold text-amber-300 border border-amber-300/30 bg-black/40">
                FSSAI Certified Unit
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Dehydration Process Matrix ── */}
      <section className="py-20 sm:py-28 border-b border-ni-border/20 bg-ni-surface2/30 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-body text-xs font-extrabold uppercase tracking-widest text-ni-rust block mb-2">
              OUR PROCESS
            </span>
            <h2 className="font-heading text-section font-black tracking-tight text-ni-primary">
              How We Turn Raw Produce Into Pure Powder
            </h2>
            <p className="font-body text-ni-secondary text-base mt-3">
              A 4-step controlled manufacturing workflow designed to protect natural volatile oils and aroma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEHYDRATION_STEPS.map((step) => (
              <div
                key={step.num}
                className="relative p-6 rounded-[24px] bg-ni-surface/80 dark:bg-[#1A1A1D]/80 border border-ni-border/30 dark:border-white/10 backdrop-blur-md shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="font-heading font-black text-3xl text-ni-rust opacity-90 group-hover:scale-110 transition-transform block mb-4">
                  {step.num}
                </span>
                <h3 className="font-heading text-lg font-bold text-ni-primary mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-xs text-ni-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quality Pillars Section ── */}
      <section className="py-20 sm:py-28 border-b border-ni-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="font-body text-xs font-extrabold uppercase tracking-widest text-ni-rust block mb-2">
              QUALITY PROMISE
            </span>
            <h2 className="font-heading text-section font-black tracking-tight text-ni-primary">
              Three Non-Negotiable Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {QUALITY_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="p-8 rounded-[28px] glass-panel-premium border border-ni-border/30 dark:border-white/10 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-3xl mb-4 block" role="img" aria-label={pillar.title}>
                  {pillar.icon}
                </span>
                <h3 className="font-heading text-xl font-bold text-ni-primary mb-3">
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
      <section className="py-20 sm:py-24 border-b border-ni-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: '40', label: 'Single-Ingredient Powders' },
              { value: '1 kg', label: 'Trial Sample Box Size' },
              { value: '25 kg', label: 'Commercial Bag Capacity' },
              { value: '100%', label: 'Natural & Pure' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 sm:p-8 rounded-[24px] bg-ni-surface/80 dark:bg-[#1A1A1D]/80 border border-ni-border/30 dark:border-white/10 shadow-card text-center hover:border-ni-rust/40 transition-colors"
              >
                <p className="font-heading text-3xl sm:text-4xl font-black text-ni-rust">{stat.value}</p>
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-ni-muted mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ── */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-transparent to-ni-surface2/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-display font-black tracking-tight text-ni-primary">
            Ready to source clean-label powders?
          </h2>
          <p className="font-body text-ni-secondary text-base sm:text-lg mt-4 max-w-2xl mx-auto">
            Order 1 kg samples to evaluate in your lab or request wholesale commercial pricing for bulk metric ton dispatches.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="md" href="/contact" className="rounded-full px-8 shadow-card hover:shadow-hover">
              Request Sample Box →
            </Button>
            <Button variant="outline" size="md" href="/products" className="rounded-full border-ni-border text-ni-primary hover:border-ni-rust">
              Explore 40 Products
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}