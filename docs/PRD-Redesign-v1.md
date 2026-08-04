# Nectar Ingredients — Blockbuster UI/UX Redesign & Performance Overhaul
## Product Requirements Document (PRD) v1.0

**Status:** Draft — awaiting approval before implementation begins
**Date:** 2026-07-31
**Product:** Nectar Ingredients (nectaringredients.com)
**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3.4 · Supabase · TypeScript 5
**Themes:** Light + Dark (both first-class, no secondary treatment)
**Visual direction:** Premium Food Editorial × Bento Catalog

---

## 1. Objective & Success Criteria

Transform Nectar Ingredients into an award-calibre, artist-grade website that feels crafted by a professional designer — not assembled from a template.

### Must achieve
- Visual identity that reads as intentional, warm, and high-craft on first glance.
- Both light and dark themes look equally designed and polished.
- Products page loads fast (no jank, no flash, no waterfall).
- Fully responsive: 320 px → 1920 px, Android Chrome, iOS Safari, desktop.
- 100% of existing copy, product data, pricing, and conversion paths preserved.
- Passes ECC anti-template policy: zero unmodified library defaults visible.

### Key performance metrics
| Metric | Target |
|---|---|
| LCP | < 2.5 s |
| INP | < 200 ms |
| CLS | < 0.1 |
| FCP | < 1.5 s |
| JS bundle landing page (gzipped) | < 150 kb |
| JS bundle app page (gzipped) | < 300 kb |
| Test coverage | ≥ 80% |

---

## 2. Visual Direction: Premium Food Editorial × Bento Catalog

### 2.1 Why this direction wins

| Direction | Risk for Nectar | Verdict |
|---|---|---|
| Pure bento | Looks SaaS / Notion dashboard — wrong category signal | ❌ |
| Pure magazine | Beautiful but product scanning is slow on mobile | ⚠️ partial |
| **Editorial + Bento Catalog (chosen)** | Magazine art direction on story pages; bento efficiency on products | ✅ |

### 2.2 Mood board in words
- **Tone:** Warm, clean, confident. Scientific rigour without clinical coldness.
- **Metaphor:** A premium ingredient journal meets a clean professional catalog.
- **Motion language:** Slow luxury. Gravity-aware. Nothing bouncy.

---

## 3. Design Tokens

### 3.1 Colour palette

All existing CSS custom properties in globals.css are retained and extended.

#### Light theme [data-theme='light']
| Token | Value | Usage |
|---|---|---|
| --bg | #FDFCF8 | Page background |
| --surface | #FFFFFF | Cards, modals |
| --surface2 | #F6F4EF | Alternate surface |
| --sage | #F1F5E9 | Section washes |
| --border | #E2DDD5 | Default borders |
| --border2 | #C8C2B8 | Stronger borders |
| --primary | #1A1A1A | Headings |
| --secondary | #717171 | Body text |
| --muted | #9A9490 | Placeholder, captions |
| --rust | #BC4B20 | Brand accent |
| --rust-lt | #D45E30 | Hover accent |
| --rust-dim | #F2D5C8 | Accent border/bg |
| --rust-bg | #FAF0EB | Accent wash |

#### Dark theme [data-theme='dark']
| Token | Value | Usage |
|---|---|---|
| --bg | #1A1A1A | Page background |
| --surface | #222222 | Cards, modals |
| --surface2 | #2A2A2A | Alternate surface |
| --sage | #1E2118 | Section washes |
| --border | #333333 | Default borders |
| --border2 | #444444 | Stronger borders |
| --primary | #F5F0E8 | Headings |
| --secondary | #A8A89E | Body text |
| --muted | #717171 | Placeholder, captions |
| --rust | #BC4B20 | Brand accent (same) |
| --rust-lt | #D45E30 | Hover accent (same) |
| --rust-dim | #7A2E0A | Accent border/bg |
| --rust-bg | #2A1A10 | Accent wash |

### 3.2 Typography

Two-font system loaded via next/font (zero layout shift, no FOUT):

| Role | Font | Fallback |
|---|---|---|
| Display / headlines | Bricolage Grotesque | Georgia, serif |
| Body / UI | Inter | system-ui, sans-serif |

Fluid scale (clamp — add to globals.css):
```css
--text-hero:  clamp(2.75rem, 1.2rem + 6vw,  7rem);
--text-h1:    clamp(2rem,    1.2rem + 3vw,   4rem);
--text-h2:    clamp(1.75rem, 1.1rem + 2.5vw, 3rem);
--text-h3:    clamp(1.25rem, 1rem   + 1vw,   1.75rem);
--text-lead:  clamp(1.125rem,1rem   + 0.4vw, 1.375rem);
--text-base:  clamp(1rem,    0.92rem + 0.35vw,1.125rem);
--text-sm:    0.875rem;
--text-xs:    0.75rem;
```

Leading: headings 1.05–1.15, body 1.65.
Tracking: headings -0.02em, uppercase labels 0.12em.

### 3.3 Spacing tokens (add to globals.css)
```css
--space-section: clamp(4rem,  5vw, 10rem);
--space-inner:   clamp(1.5rem,2vw,  3rem);
--space-gap:     clamp(1rem,  2vw,  2.5rem);
```

### 3.4 Radius tokens (add to globals.css)
```css
--radius-sm:   0.5rem;
--radius-md:   0.75rem;
--radius-lg:   1rem;
--radius-xl:   1.5rem;
--radius-full: 9999px;
```

---

## 4. Component Specifications

### 4.1 Navigation bar
- Transparent on page-top → glass bg + blur(16px) after 40px scroll.
- Logo (left) · Nav links (centre, desktop) · [Theme toggle | Sample basket | Auth] (right).
- Mobile: hamburger → full-screen overlay with links + theme toggle.
- Height: 64px desktop, 56px mobile. Sticky, z-index 50.

### 4.2 Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | var(--rust) | #FFF / cream | none | var(--rust-lt) + lift |
| Outline | transparent | var(--rust) | var(--rust) | fill rust |
| Ghost | transparent | var(--rust) | none | rust wash bg |
| Muted | var(--surface2) | var(--secondary) | var(--border) | surface |

All variants: border-radius var(--radius-full). Min tap target 44px.
Hover: translateY(-2px) + shadow lift (compositor only).

### 4.3 Product card layout

```
┌─────────────────────────────┐
│ [Category pill]             │
│                             │
│ Product Name                │
│ Short description (2-line)  │
│                             │
│ ─── hover reveals ──────── │
│ Moisture · Mesh · Origin    │
│ ───────────────────────── │
│ [Add to Sample] [Inquire →] │
└─────────────────────────────┘
```

- bg: var(--surface), border: 1px solid var(--border), radius: var(--radius-lg)
- Hover: translateY(-4px) + var(--shadow-hover)
- Spec row: opacity 0 + translateY(4px) → opacity 1 + translateY(0) on card hover

### 4.4 Section heading component
- Small uppercase rust tag above heading
- Display font headline
- Optional lead sub-text, muted colour
- Left-aligned default, centred variant

### 4.5 Accordion (FAQ)
- Custom SVG chevron, rotates 180° on open
- Animate grid-template-rows 0fr → 1fr (no height JS)
- Separator borders between items only

---

## 5. Page-by-Page Specifications

### 5.1 Homepage (/)

Section order: Hero → Stats Bar → Featured Products → Process → About Teaser → FAQ → Contact CTA

#### Hero
- Full-bleed, min-height 100svh
- Background: facility-hero.jpg as Next.js Image with fill + priority
- Overlay: var(--hero-overlay)
- Content: tag (rust, xs, uppercase) → display headline → lead paragraph → CTAs
- Parallax: hero image translateY at 30% scroll speed via requestAnimationFrame + CSS var

#### Stats bar
- Sage wash background, full-width
- 4–5 key facts: years, powders, batch tests, delivery states
- Count-up animation on scroll-into-view
- Large number in display font rust, label in xs muted below

#### Featured products
- Heading + sub-text
- Asymmetric desktop grid: 1 large (2×2) + 3 standard cards
- Mobile: single column stack
- "View all powders →" link below

#### Process section
- Two-column desktop: facility-process.jpg left, numbered steps right
- Steps 01–06: rust number, bold label, muted description
- Vertical connector line via CSS pseudo-element
- Fade-up reveal on scroll

#### About teaser
- Left: brand copy from About page
- Right: stacked facility-hero.jpg (top 60%) + facility-process.jpg (bottom 40%), slight offset
- "Our story →" CTA

#### FAQ
- Centred heading, max-width 720px
- Custom accordion (5–8 questions)

#### Contact CTA
- Full-width rust/sage gradient band
- Large headline + sub + primary button to /contact

---

### 5.2 Products Page (/products)

#### Current performance problems
1. export const dynamic = 'force-dynamic' prevents any caching
2. Supabase price fetch blocks SSR on every single request
3. Auth state fetch is sequential, adds waterfall
4. Search fires re-render on every keystroke (no debounce)

#### New performance architecture

```
app/products/page.tsx (RSC)
  export const revalidate = 3600        ← ISR: prices cached 1 hr
  └── fetch prices from Supabase
  └── <ProductsClient initialPrices={prices} />

ProductsClient.tsx ('use client')
  ├── auth: fire-and-forget useEffect (non-blocking)
  ├── search: useDebounce(300ms) + useMemo filtered list
  ├── category filter: useMemo
  └── ProductGrid (React.memo)
```

#### Layout
- Editorial page header (headline + brochure download)
- Sticky filter bar: search + category chips + sort
- Grid: 1 col (mobile) → 2 (sm) → 3 (lg) → 4 (xl)
- Extended range: compact bento row cards

---

### 5.3 About Page (/about)
- Hero: full-bleed facility-hero.jpg with editorial headline
- Story sections: alternating two-column editorial layout
- Values: bento grid 3–4 cards
- Facility: both photos in editorial composition
- Contact CTA at bottom

### 5.4 Contact Page (/contact)
- Split: form left (60%) + info panel right (40%)
- Fields: Name, Company, Email, Phone (optional), Product interest, Message
- Zod validation on all fields before server action
- Inline success/error states
- Right panel: address, email, phone, map

### 5.5 Auth Pages
- Minimal glass card, centred
- Rust primary CTA button
- Existing Supabase auth flow unchanged

---

## 6. Facility Photo Asset Names

Add these two files to /public/images/. The code references them by these exact names:

| Filename | Purpose | Used in |
|---|---|---|
| facility-hero.jpg | Main facility / ingredient photo | Homepage hero, About hero, About teaser |
| facility-process.jpg | Secondary process / detail photo | Process section, About facility |

Recommended specs:
- facility-hero.jpg: min 1920×1080px, 16:9 or 21:9, < 300kb compressed
- facility-process.jpg: min 1200×900px, 4:3 or 3:2, < 200kb compressed
- Format: AVIF or WebP preferred; JPG accepted
- Tone: warm, natural, slightly desaturated to complement terracotta palette

Fallback: if images are missing, components use CSS gradient so page never breaks.

---

## 7. Motion Specification

### Core principles
1. Compositor-only properties: transform, opacity, clip-path
2. Never animate: width, height, top, left, margin, padding, border-width
3. Always respect prefers-reduced-motion: reduce (skip all animation)
4. Default easing: cubic-bezier(0.16, 1, 0.3, 1) — ease-out-expo (slow luxury)

### Animation catalogue

| Element | Property | Duration | Trigger |
|---|---|---|---|
| Hero headline | opacity 0→1, translateY 24px→0 (staggered) | 700ms, 80ms stagger | Page load |
| Hero sub + CTA | opacity 0→1, translateY 24px→0 | 700ms, delay 300ms | Page load |
| Section content | opacity 0→1, translateY 32px→0 | 600ms | Scroll IntersectionObserver |
| Product card hover | translateY 0→-4px, shadow | 250ms | Hover |
| Spec row reveal | opacity 0→1, translateY 4px→0 | 200ms | Card hover |
| Stats counter | number 0→value interpolation | 1200ms | Scroll IntersectionObserver |
| Nav background | background-color, backdrop-filter | 300ms | Scroll > 40px |
| Accordion | grid-template-rows 0fr→1fr | 300ms | Click |
| Theme toggle | opacity crossfade | 150ms | Click |
| Drawer | translateX 100%→0 | 350ms | Product click |
| Button hover | translateY 0→-2px | 200ms | Hover |
| Category chip press | scale 0.95→1 | 100ms | Active |

### Implementation approach
- Simple section reveals: CSS @keyframes + class toggle via IntersectionObserver
- Hover effects: CSS transition on specific properties (not transition-all)
- Hero parallax: rAF loop sets --scroll-y CSS var; CSS applies transform
- Complex orchestration only: use motion library if hero stagger gets complex

---

## 8. Performance Refactor: Products Page Detail

### Step 1 — Remove force-dynamic, add ISR
```typescript
// app/products/page.tsx
// REMOVE: export const dynamic = 'force-dynamic'
// ADD:
export const revalidate = 3600 // prices cached 1 hour

export default async function ProductsPage() {
  let prices: Record<string, number> = {}
  try {
    const supabase = createClient()
    const { data } = await supabase.from('product_prices').select('sku, base_price')
    if (data) {
      prices = data.reduce((acc, curr) => {
        acc[curr.sku] = Number(curr.base_price)
        return acc
      }, {} as Record<string, number>)
    }
  } catch (err) {
    console.error('Price fetch failed:', err)
  }
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsClient initialPrices={prices} />
    </Suspense>
  )
}
```

### Step 2 — useDebounce hook (new file: hooks/useDebounce.ts)
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
```

### Step 3 — Memoized filter in ProductsClient
```typescript
const debouncedSearch = useDebounce(searchTerm, 300)
const filteredProducts = useMemo(() =>
  products
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
  [debouncedSearch, activeCategory]
)
```

### Step 4 — Non-blocking auth
```typescript
useEffect(() => {
  // Fire and forget — do not await, do not block render
  supabase.auth.getUser().then(({ data }) => setUser(data.user))
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
    setUser(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}, [])
```

---

## 9. Accessibility Checklist

- [ ] Skip-to-content <a href="#main-content"> as first DOM child
- [ ] Semantic HTML: header, nav, main, section, article, footer
- [ ] All interactive elements keyboard accessible
- [ ] Focus rings visible on all interactive elements (var(--rust) outline)
- [ ] Color contrast ≥ 4.5:1 for all text in both themes
- [ ] ARIA labels on icon-only controls (theme toggle, basket, close)
- [ ] Form inputs have associated <label> via htmlFor
- [ ] Images: descriptive alt; decorative images alt=""
- [ ] Modals/drawers: focus trap on open, restore focus on close
- [ ] prefers-reduced-motion: all animations instant/skipped
- [ ] Mobile tap targets ≥ 44×44px

---

## 10. Security Checklist

- [ ] No hardcoded secrets in any file
- [ ] Contact form: Zod validation before server action
- [ ] Supabase: parameterised client only (no string-concat queries)
- [ ] No dangerouslySetInnerHTML on user input
- [ ] Server enforces auth; client render-gate is display only
- [ ] NEXT_PUBLIC_* vars contain no secrets
- [ ] Rate limit on contact/inquiry endpoints
- [ ] Error messages: no stack traces exposed to client
- [ ] External links: rel="noopener noreferrer" on all target="_blank"

---

## 11. Testing Plan

### Unit (Vitest or Jest)
- useDebounce hook
- useSampleBasket context
- Product filter/sort utility functions
- Price formatting utilities
- Zod contact form schema

### Integration
- Products page renders with mocked Supabase prices
- Sample basket add/remove/clear
- Contact form submission (mocked server action)

### E2E (Playwright)
- Homepage load, hero visible, CTAs clickable
- Product grid renders all 24 products
- Category filter shows correct subset
- Search filters in real-time (debounced)
- Sample box add → basket count increments
- Contact form submit → success state shown
- Theme toggle switches light ↔ dark
- Brochure PDF download link present

### Visual regression (Playwright screenshots)
- Breakpoints: 320, 375, 768, 1024, 1440, 1920px
- Pages: homepage, products, about, contact
- Both themes captured

---

## 12. Implementation Phases

| # | Phase | Tasks | Agent/Skill |
|---|---|---|---|
| 0 | Discovery | Codebase map, identify bottlenecks | ecc:code-explorer |
| 1 | Design tokens | Extend globals.css, add font/spacing/radius vars | ecc:multi-frontend |
| 2 | Performance fix | ISR, debounce, memoize, non-blocking auth | ecc:performance-optimizer |
| 3 | Core components | Button, Card, Nav, SectionHeading, Accordion | ecc:multi-frontend |
| 4 | Homepage | Hero, StatsBar, FeaturedProducts, Process, AboutTeaser, FAQ, CTA | ecc:multi-frontend |
| 5 | Products page | Bento catalog layout, filter bar, product card redesign | ecc:multi-frontend |
| 6 | About + Contact | Editorial layout, 2 facility photos, Zod form | ecc:multi-frontend |
| 7 | Auth pages | Minimal glass card, preserve Supabase flow | ecc:multi-frontend |
| 8 | Motion | Scroll reveals, hover effects, hero parallax | ecc:motion-advanced |
| 9 | Testing | Unit + integration + E2E + visual regression | ecc:tdd-guide, ecc:e2e-runner |
| 10 | Audit | Code review, security scan, a11y audit | ecc:code-reviewer, ecc:security-reviewer |

---

## 13. Open Questions (decide before Phase 3)

1. Font choice: Bricolage Grotesque (modern editorial) or Playfair Display (classic elegance)?
2. Product detail: keep slide-in drawer, or move to /products/[slug] route?
3. Animation library: pure CSS + IntersectionObserver, or motion for hero orchestration?
4. Contact form: Zod + server action in Phase 6, or stub for now?

---

## 14. Approval Checklist (sign off before any code changes)

- [ ] Visual direction approved: Premium Food Editorial x Bento Catalog
- [ ] Colour palette approved for light and dark themes
- [ ] Typography pair approved: Bricolage Grotesque (display) + Inter (body)
- [ ] Facility photo filenames confirmed: facility-hero.jpg + facility-process.jpg
- [ ] Performance approach approved: ISR revalidate=3600 + debounce + memoize
- [ ] Animation principle approved: compositor-only, slow-luxury, reduced-motion respected
- [ ] Testing approach approved: 80% coverage + Playwright E2E

---

*End of PRD — Nectar Ingredients Redesign v1.0 — 2026-07-31*
