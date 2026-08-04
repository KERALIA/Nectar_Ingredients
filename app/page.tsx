import type { Metadata } from 'next'
import Hero from '../components/home/Hero'
import StatsBar from '../components/home/StatsBar'
import FeaturedProducts from '../components/home/FeaturedProducts'
import B2BOverviewSection from '../components/home/B2BOverviewSection'
import B2BIndustrySolutions from '../components/home/B2BIndustrySolutions'
import ProcessSection from '../components/home/ProcessSection'
import AboutTeaser from '../components/home/AboutTeaser'
import FAQSection from '../components/home/FAQSection'
import ContactCTA from '../components/home/ContactCTA'

export const metadata: Metadata = {
  title: 'Nectar Ingredients | Premium Food Ingredients Supplier',
  description: 'Leading B2B manufacturer and bulk supplier of pure dehydrated vegetable, fruit, and spice powders in Surendranagar, Gujarat. Clean label food ingredients.',
  alternates: {
    canonical: 'https://nectaringredients.vercel.app/',
  },
  openGraph: {
    title: 'Nectar Ingredients | Premium Food Ingredients Supplier',
    description: 'Leading B2B manufacturer and bulk supplier of pure dehydrated vegetable, fruit, and spice powders in Surendranagar, Gujarat.',
    url: 'https://nectaringredients.vercel.app/',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedProducts />
      <B2BOverviewSection />
      <B2BIndustrySolutions />
      <ProcessSection />
      <AboutTeaser />
      <FAQSection />
      <ContactCTA />
    </>
  )
}