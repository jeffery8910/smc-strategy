/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './pages/**/*.tsx',
    './components/**/*.tsx'
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E3A8A', // Dark Blue
        'secondary': '#10B981', // Green
        'accent': '#F59E0B', // Amber
        'neutral': '#1F2937', // Dark Gray
        'base-100': '#FFFFFF', // White
        'base-200': '#F3F4F6', // Light Gray
        'base-300': '#E5E7EB', // Lighter Gray
      }
    },
  },
  plugins: [],
}
