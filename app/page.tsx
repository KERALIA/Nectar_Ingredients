import Hero from '../components/home/Hero'
import StatsBar from '../components/home/StatsBar'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ProcessSection from '../components/home/ProcessSection'
import AboutTeaser from '../components/home/AboutTeaser'
import ContactCTA from '../components/home/ContactCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <FeaturedProducts />
      <ProcessSection />
      <AboutTeaser />
      <ContactCTA />
    </>
  )
}