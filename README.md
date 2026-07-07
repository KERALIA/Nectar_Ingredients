# Nectar Ingredients Website

A premium, modern, responsive website built with **Next.js**, **React 19**, **TypeScript**, and **Tailwind CSS** for **Nectar Ingredients**—a clean-label manufacturer of single-ingredient dehydrated vegetable, fruit, and spice powders based in Surendranagar, Gujarat (established 2011).

## 🚀 Features

- **Product Catalog**: Explore a curated catalog of 24 single-ingredient vegetable, fruit, and spice powders.
- **Sample Basket**: A custom sample-request flow allowing businesses and users to add products to a request basket (minimum 1 kg sample size) and submit inquiry forms.
- **Modern UI/UX**: 
  - Sleek, custom-tailored dark and light mode styling with clean transitions.
  - High-performance responsive layouts optimized for all device sizes.
  - Modern animations (counters, fading elements, theme toggling).
  - Zero third-party bloat (using vanilla React state and context).
- **SEO & Performance Optimized**: Pre-configured metadata structure, semantic markup, sitemap, and robots configurations.

## 🛠️ Technology Stack

- **Framework**: Next.js 16.2+ (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS Variables
- **Icons**: Custom SVG icons for minimal bundle sizes

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (pages: about, contact, products, home)
├── components/           # Reusable UI components & section blocks
│   ├── home/             # Home page specific sections (Hero, StatsBar, ProcessSection, etc.)
│   ├── layout/           # Shared layout components (Header, Footer)
│   ├── products/         # Product-specific catalog components
│   └── ui/               # Core atomic components (Button, Tag, ThemeToggle, etc.)
├── context/              # Global React Contexts (e.g. Sample Basket state)
├── lib/                  # Utilities, custom hooks, and static data arrays
├── public/               # Static assets (images, icons)
├── types/                # TypeScript interfaces and global declarations
├── tailwind.config.ts    # Custom Tailwind theme tokens (colors, fonts, keyframes)
└── tsconfig.json         # TypeScript compiler configurations
```

## 💻 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended) installed.

### Installation

1. Clone or copy the project files to your directory.
2. Navigate to the project root and install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server with Turbopack:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the website.

### Production Build

To build the application for production deployment:
```bash
npm run build
```

This runs the TypeScript compiler and generates an optimized production build under the `.next/` directory.

To start the production server locally:
```bash
npm run start
```

### Linting

To run ESLint and check for code styling/issues:
```bash
npm run lint
```

## 📄 License

This project is private and proprietary to Nectar Ingredients. All rights reserved.
