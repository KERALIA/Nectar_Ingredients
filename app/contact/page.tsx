import ContactClient from './ContactClient'
import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Contact Commercial Sales & R&D Samples | Nectar Ingredients',
  description: 'Get in touch with Nectar Ingredients. Request a 1kg sample box, inquire about wholesale pricing, or discuss custom dehydrated food powder formulations.',
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
}

export default function ContactPage() {
  return <ContactClient />
}
