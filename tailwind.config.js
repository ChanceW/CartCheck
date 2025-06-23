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
        'primary': '#5E3A87',      // Deep Royal Purple
        'accent': '#D4AF37',       // Rich Metallic Gold
        'background': '#F5F3FA',   // Soft Lavender Gray
        'primary-light': '#7B5BA3',
        'primary-dark': '#4A2E6B',
        'accent-light': '#E6C659',
        'accent-dark': '#B8971C',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 