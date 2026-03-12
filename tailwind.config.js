/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        wa: {
          green: '#25D366',
          teal: '#128C7E',
          dark: '#075E54',
          light: '#DCF8C6',
          'chat-bg': '#ECE5DD',
          blue: '#34B7F1',
          'msg-in': '#FFFFFF',
          'msg-out': '#DCF8C6',
          'header': '#075E54',
          'input-bg': '#F0F0F0',
        },
        brand: {
          primary: '#0D7377',
          'primary-light': '#14919B',
          secondary: '#F59E0B',
          'secondary-dark': '#D97706',
          accent: '#1E3A5F',
          emergency: '#DC2626',
          success: '#059669',
        },
      },
    },
  },
  plugins: [],
};
