export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  category: 'vegetable' | 'fruit' | 'spice'
  swatchColor: string
  swatchHex: string
  weights: string[]
  sku: string
  mesh: string
  description: string
  featured: boolean
  imageSrc: string
  rawImageSrc: string
  swatchImageSrc: string
}

export interface Stat {
  value: string
  label: string
}

export interface ProcessStep {
  tag: string
  heading: string
  body: string
}