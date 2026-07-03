/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Crimson Pro"', 'Georgia', 'serif'],
        ui: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        paper: 'var(--felix-color-background)',
        ink: 'var(--felix-color-ink)',
        accent: 'var(--felix-color-primary)',
      },
    },
  },
  plugins: [],
};
