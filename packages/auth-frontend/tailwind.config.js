/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          DEFAULT: '#11141A',
          deep: '#0B0D11',
          panel: '#171B22',
          line: '#282E3A',
        },
        brass: {
          DEFAULT: '#C99A46',
          light: '#E3C077',
          dim: '#8A6C36',
        },
        ivory: {
          DEFAULT: '#FAF6EC',
          dim: '#F0EAD9',
        },
        ink: {
          DEFAULT: '#1B1D22',
          soft: '#585C66',
        },
        sage: '#6E9B7B',
        rust: '#C1584A',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dial: {
          '0%': { transform: 'rotate(var(--from))' },
          '100%': { transform: 'rotate(var(--to))' },
        },
      },
      animation: {
        rise: 'rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
