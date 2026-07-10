# Nectar Ingredients

**Official website for Nectar Ingredients Pvt. Ltd.** — manufacturer of single-ingredient dehydrated vegetable, fruit, and spice powders based in Surendranagar, Gujarat, India. Est. 2011.

🌐 **Live site:** [nectaringredients.com](https://nectaringredients.com)

---

## About

Nectar Ingredients supplies clean-label dehydrated powders to food businesses, nutraceutical companies, cloud kitchens, and home kitchens across India. No fillers, no additives — just concentrated, single-ingredient powder.

This repository contains the full source code for the public-facing product catalog and inquiry website.

---

## Tech Stack

| Layer         | Technology |
|---------------|-----------|
| Framework     | [Next.js 15](https://nextjs.org/) (App Router) |
| Language      | TypeScript |
| Styling       | [Tailwind CSS v3](https://tailwindcss.com/) + CSS Custom Properties |
| Fonts         | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) + [Inter](https://fonts.google.com/specimen/Inter) via `next/font` |
| Images        | `next/image` (AVIF + WebP output) |
| Deployment    | Vercel (recommended) |

---

## Features

- 🌙 **Dark / Light mode** — system-aware with FOUC-free localStorage persistence
- 📦 **Sample basket** — add up to N products and send a single WhatsApp inquiry
- 🔍 **Live search** — filter products by name, description, category, and SKU across all pages
- 🏷️ **Category filter + sort** — by vegetable / fruit / spice, alphabetically or by featured
- 📋 **Product drawer** — detailed spec sheet (SKU, mesh, packaging, applications) as a slide-up on mobile, slide-in on desktop
- 📱 **Mobile-first** — bottom-sheet product drawer, horizontal scroll swatch strip, iOS safe-area support
- ⚡ **Optimised** — AVIF/WebP images, gzip compression, font preloading, SVH mobile viewport

---

## Project Structure

```
nectar-ingredients/
├── app/
│   ├── layout.tsx          # Root layout with Navbar, Footer, providers
│   ├── globals.css         # Design tokens, Tailwind overrides, mobile fixes
│   ├── page.tsx            # Home page
│   ├── about/page.tsx      # About page
│   ├── contact/page.tsx    # Contact / inquiry form (WhatsApp integration)
│   ├── products/           # Products catalog
│   ├── robots.ts           # robots.txt generation
│   └── sitemap.ts          # Sitemap generation
│
├── components/
│   ├── home/               # Hero, StatsBar, SwatchStrip, ProcessSection, etc.
│   ├── layout/             # Navbar, Footer
│   ├── products/           # ProductCard, ProductGrid, ProductDrawer, etc.
│   └── ui/                 # Button, Tag, AnimatedCounter, ThemeToggle, etc.
│
├── context/
│   ├── SampleBasketContext.tsx
│   └── SearchContext.tsx
│
├── lib/
│   ├── data.ts             # Product data (25 SKUs + extended range)
│   └── hooks.ts            # useScrollReveal hook
│
├── public/
│   ├── Images/             # Product images (PNG)
│   └── NECTAR_BROCHURE.pdf
│
└── types/                  # TypeScript type definitions
```

---

## Getting Started

### Prerequisites

- Node.js `>= 18.17.0`
- npm `>= 9`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nectar-ingredients.git
cd nectar-ingredients

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## Deployment

This project is optimised for **Vercel** deployment:

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Set root directory to `/` (default)
4. Deploy — no environment variables required

The project uses Next.js App Router and is fully compatible with Vercel's edge network.

---

## Adding or Editing Products

All product data lives in [`lib/data.ts`](./lib/data.ts).

Each product object follows the `Product` type defined in [`types/index.ts`](./types/index.ts):

```typescript
{
  id: string              // Unique ID
  slug: string            // URL-safe identifier
  name: string            // Display name
  tagline: string         // Short descriptor
  category: 'vegetable' | 'fruit' | 'spice'
  swatchHex: string       // Color for UI glow effects
  weights: string[]       // e.g. ['1kg', '5kg', '25kg']
  sku: string             // e.g. 'NI-TOM-001'
  mesh: string            // e.g. '80 mesh'
  description: string
  featured: boolean
  imageSrc: string        // Path in /public/Images/
  swatchImageSrc: string  // Same as imageSrc in most cases
  packagingSize?: string
  usageApplications?: string[]
}
```

---

## Contact

**Nectar Ingredients Pvt. Ltd.**
Shop No. 18 & 19, Second Floor, Brahmanand Chamber
Opp. M.P. Shah Arts & Science College, S.T. Road
Surendranagar, Gujarat 363001, India

📞 +91 98798 38281
📧 hello@nectaringredients.com
💬 [WhatsApp](https://wa.me/919879838281)

---

## License

All rights reserved © Nectar Ingredients Pvt. Ltd.
This source code is provided for reference only. Unauthorised copying, modification, or redistribution is not permitted.
