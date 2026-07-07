import ProductGrid from '../../components/products/ProductGrid'
import ProductsClient from './ProductsClient'

export const metadata = {
  title: 'Products — Nectar Ingredients',
  description: '24 single-ingredient dehydrated food powders. Available from 1kg samples to 25kg commercial bags.',
}

export default function ProductsPage() {
  return <ProductsClient />
}