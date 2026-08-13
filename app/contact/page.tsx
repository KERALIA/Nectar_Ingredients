import ContactClient from './ContactClient'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contact Commercial Sales & R&D Samples | Nectar Ingredients',
  description: 'Get in touch with Nectar Ingredients. Request a 1kg sample box, inquire about wholesale pricing, or discuss custom dehydrated food powder formulations.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
}

export default function ContactPage() {
  return <ContactClient />
}
