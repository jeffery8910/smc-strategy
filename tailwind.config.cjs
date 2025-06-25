const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.resolve(__dirname, './index.html'),
    path.resolve(__dirname, './App.tsx'),
    path.resolve(__dirname, './pages/**/*.{js,ts,jsx,tsx}'),
    path.resolve(__dirname, './components/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
