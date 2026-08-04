# Nectar Ingredients: Artistic & Kinetic Redesign Strategy

## 1. Visual Language Deconstruction & Analysis
Based on the explicit rejection of the "Premium Food Editorial x Bento Catalog" and the pivot towards a "very professional yet artistic look" inspired by "great artists online," the previous design was likely too constrained, boxed-in, and safe. 

**What "Hits Different" in Modern Web Artistry:**
*   **Grid Breaking:** Moving away from symmetrical, predictable columns and bento boxes. Elements overlap, scale dramatically, and utilize negative space unapologetically.
*   **Kinetic Typography:** Text isn't just readable; it's structural and animated. Massive display fonts act as hero graphics.
*   **Fluid & Organic Motion:** Instead of standard CSS transitions, animations feel liquid, continuous, and physical (e.g., GSAP scroll triggers, custom easing, canvas/WebGL effects).
*   **Atmosphere over Interface:** The UI recedes. Instead of obvious cards and borders, content is separated by scale, contrast, and motion. 

## 2. New Design Direction: "Kinetic Modernism"
The new direction bridges high-end professional reliability with avant-garde digital artistry. It should feel like an interactive exhibition of ingredients rather than a traditional e-commerce catalog.

### Aesthetic Pillars
*   **Color Palette:** Move away from pure whites and safe grays. Use rich, deep ambient backgrounds (e.g., `Obsidian Black`, `Raw Umber`, or `Alabaster`) to make the vibrant colors of the powders (mango yellow, beetroot red, mint green) explode off the screen.
*   **Typography:** A dramatic pairing. A highly expressive, elegant Serif for massive display headings, paired with a brutalist, ultra-legible mono or geometric sans-serif for technical details.
*   **Texture & Depth:** Subtle noise overlays, organic blur gradients, and fluid distortions on scroll rather than hard drop shadows.

## 3. Component & Layout Strategy

### The Homepage
*   **Hero Section:** A full-viewport, immersive experience. A custom canvas/SVG animation (e.g., powder particles flowing or a liquid color reveal) triggered by scroll. Minimal interface—just massive typography and the animation.
*   **Navigation:** Disappear on scroll down, reveal on scroll up. Hidden behind a custom, artistic hamburger menu that expands into a full-screen typographic overlay.

### Product Listing (The "Infinite Canvas")
*   **Asymmetrical Layout:** Products are not in a grid. They are laid out in an asymmetrical, staggering list that requires scrolling to explore, making each product feel like an individual piece of art.
*   **Virtualization & Lazy Loading:** 
    *   **Implementation:** Implement a virtualized list (e.g., using `@tanstack/react-virtual` or custom `IntersectionObserver` hooks).
    *   **Behavior:** Render only the 4 visible products in the DOM. As the user scrolls, the next products are injected into the DOM, and out-of-view products are removed. 
    *   **Performance:** This ensures 60fps scrolling even with high-resolution imagery and heavy shaders/animations per product.

### The Product Card (Deconstructed)
*   No visible borders or "card" backgrounds. 
*   The product image is massive and floats.
*   On hover, a custom cursor appears (e.g., "View Extract"), and the image distorts slightly using a WebGL displacement map or a smooth GSAP scale/rotate effect.

### Custom Loading Animation
*   **Initial Load:** A highly artistic, full-screen preloader. This could be an SVG path morphing from a geometric shape into a natural ingredient shape (like a leaf or drop), or a typography-based loader ("N E C T A R" expanding kerning until it clears the screen).
*   **Transition:** The loader doesn't just disappear; it scales up and acts as a mask revealing the home page underneath.

## 4. Actionable Implementation Plan

### Phase 1: Engine & Foundation Setup
*   **[ ] Dependencies:** Install `gsap`, `@gsap/react`, `lenis` (for smooth scrolling), and potentially `three.js` or `framer-motion` for complex interactions.
*   **[ ] Global Tokens (`tailwind.config.ts`):** 
    *   Strip out standard card shadows and bento radiuses. 
    *   Add fluid typography scales (`clamp()`).
    *   Define the new artistic color palette (ambient darks/lights, stark contrasts).
*   **[ ] Typography:** Inject the new Display (Serif) and Technical (Sans/Mono) fonts.

### Phase 2: Custom Loader & Smooth Scroll
*   **[ ] Lenis Setup:** Implement `lenis` globally to ensure scroll-jacking is smooth and fluid, which is required for high-end artistic scroll effects.
*   **[ ] Preloader Component:** Build the custom SVG/Canvas loading animation. Block the main thread rendering until this completes, then trigger a timeline to reveal the app layout.

### Phase 3: The Virtualized Product Layout
*   **[ ] Intersection Engine:** Build a custom hook utilizing `IntersectionObserver` to track the viewport.
*   **[ ] Virtual Grid Component:** Create the asymmetrical list. Ensure only `Math.min(products.length, 4)` components are fully mounted with their images and animations active at any time. Unmounted products should leave a calculated empty space (spacer divs) to maintain scroll height.

### Phase 4: Artistic Interactions
*   **[ ] Custom Cursor:** Implement a global custom cursor that changes state depending on what it hovers over (e.g., turns into a "Drag" icon on carousels, or expands over products).
*   **[ ] Image Reveal:** Use GSAP ScrollTrigger to animate product images as they enter the viewport (e.g., unmasking them from the bottom up, with a slight parallax effect).
*   **[ ] Hover States:** Replace standard CSS hovers with GSAP timelines for liquid, physics-based reactions.