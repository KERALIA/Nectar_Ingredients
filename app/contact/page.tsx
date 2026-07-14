import ContactClient from './ContactClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Nectaringredients. Request a 1kg sample box, inquire about wholesale pricing, or discuss custom dehydrated food powder formulations.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
