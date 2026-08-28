/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2fbf4',
          100: '#e1f6e6',
          200: '#c5ecd0',
          300: '#99dbae',
          400: '#64c284',
          500: '#3fa663',
          600: '#2f884d',
          700: '#276c3f',
          800: '#235634',
          900: '#1e472d',
          950: '#0c2717',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        tomato: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        soil: {
          50: '#faf6f0',
          100: '#f3ebe0',
          200: '#e6d5c0',
          300: '#d4bba0',
          400: '#bf9d7e',
          500: '#ad8464',
          600: '#976e53',
          700: '#7c5844',
          800: '#65483b',
          900: '#543c33',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }) {
      addUtilities({
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      });
    },
  ],
}
