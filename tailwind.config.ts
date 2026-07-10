import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme color tokens mapping directly to CSS Variables
        'ni-bg':           'var(--bg)',
        'ni-surface':      'var(--surface)',
        'ni-surface2':     'var(--surface2)',
        'ni-border':       'var(--border)',
        'ni-border2':      'var(--border2)',
        'ni-muted':        'var(--muted)',
        'ni-secondary':    'var(--secondary)',
        'ni-primary':      'var(--primary)',
        'ni-rust':         'var(--rust)',
        'brand-orange':    'var(--rust)',
        'ni-rust-lt':      'var(--rust-lt)',
        'ni-rust-dim':     'var(--rust-dim)',
        'ni-rust-bg':      'var(--rust-bg)',
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
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
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
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideLeft: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer:   { '100%': { transform: 'translateX(100%)' } },
        glowPulse: { '0%, 100%': { opacity: '0.8', filter: 'blur(40px)' }, '50%': { opacity: '1', filter: 'blur(55px)' } },
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