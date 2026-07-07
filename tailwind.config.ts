import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme (ni-*)
        'ni-bg':           '#0F0F0D',
        'ni-surface':      '#1A1A17',
        'ni-surface2':     '#242420',
        'ni-border':       '#2E2E29',
        'ni-border2':      '#3D3D37',
        'ni-muted':        '#6B6B62',
        'ni-secondary':    '#A8A89E',
        'ni-primary':      '#E8E4DC',
        'ni-rust':         '#D4521A',
        'ni-rust-lt':      '#F07040',
        'ni-rust-dim':     '#7A2E0A',
        'ni-rust-bg':      '#1F1208',
        // Light theme (li-*) — warm cream/paper tones
        'li-bg':           '#F5F0E8',
        'li-surface':      '#EDE7DC',
        'li-surface2':     '#E4DCCF',
        'li-border':       '#D4CCC0',
        'li-border2':      '#B8AFA3',
        'li-muted':        '#8C857A',
        'li-secondary':    '#5C5650',
        'li-primary':      '#1C1917',
        // Accent colors (same for both themes)
        'pw-tomato':       '#C23B22',
        'pw-onion':        '#C9855A',
        'pw-garlic':       '#E8DCC8',
        'pw-beetroot':     '#8B1A4A',
        'pw-spinach':      '#4A7C45',
        'pw-ginger':       '#C4892A',
        'pw-turmeric':     '#D4A017',
        'pw-amla':         '#6B8E3E',
        'pw-mango':        '#8FA832',
        'pw-pomegranate':  '#9B2335',
        'pw-lemon':        '#F2C94C',
        'pw-carrot':       '#E67E22',
        'pw-annatto':      '#D9720B',
        'pw-strawberry':   '#C8375A',
        'pw-orange':       '#F39C12',
        'pw-mangosweet':   '#F5B041',
        'pw-cream':        '#FDF6E3',
        'pw-curd':         '#FFFDF5',
        'pw-butter':       '#F7DC6F',
        'pw-caramel':      '#6B3E26',
        'pw-tamarind':     '#7A5230',
        'pw-mint':         '#7FB069',
        'pw-cheese':       '#F5D580',
        'pw-banana':       '#F0E15A',
      },
      fontFamily: {
        heading: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero':    ['clamp(2.2rem, 7vw, 5rem)',  { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display': ['clamp(2rem, 4vw, 3.2rem)',   { lineHeight: '1.12', letterSpacing: '-0.025em' }],
        'section': ['clamp(1.5rem, 3vw, 2.2rem)', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-left': 'slideLeft 0.5s ease forwards',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string | Record<string, string>>>) => void }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    },
  ],
}
export default config