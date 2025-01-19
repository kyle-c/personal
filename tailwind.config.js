/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        crimson: ['"Crimson Pro"', 'serif'],
      },
      maxWidth: {
        'prose': '65ch',
      },
      spacing: {
        'nav': '4rem',
      },
    },
  },
  plugins: [],
};