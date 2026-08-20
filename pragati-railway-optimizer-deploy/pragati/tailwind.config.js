/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          orange: '#FF6B00',
          deepOrange: '#F45100',
          blue: '#063B7A',
          navy: '#052B5F',
          darkNavy: '#031B3D',
          brightBlue: '#0878F9',
          lightBlue: '#EBF3FF',
          bg: '#F5F8FC',
          border: '#E2E8F0',
          card: '#FFFFFF',
          green: '#16A34A',
          amber: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 25px -5px rgba(6, 59, 122, 0.08), 0 8px 10px -6px rgba(6, 59, 122, 0.04)',
        'glow-orange': '0 0 15px rgba(255, 107, 0, 0.35)',
        'glow-blue': '0 0 15px rgba(8, 120, 249, 0.35)'
      }
    },
  },
  plugins: [],
}
