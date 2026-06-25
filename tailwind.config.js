/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2330',
        paper: '#F2F3EF',
        paper2: '#E9EBE4',
        steel: '#C9CDC6',
        slate: '#4A5568',
        amber: {
          DEFAULT: '#FFB100',
          dark: '#CC8B00',
        },
        compliant: {
          DEFAULT: '#1F7A4D',
          light: '#E4F2EA',
        },
        danger: '#B3261E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        lg: '6px',
      },
      backgroundImage: {
        'perforation': 'repeating-linear-gradient(to right, transparent, transparent 6px, #C9CDC6 6px, #C9CDC6 8px)',
      },
    },
  },
  plugins: [],
};
