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
        forest: {
          DEFAULT: '#012d1d',
          light: '#0a3a27',
          container: '#1b4332',
          surface: '#2d5a45',
        },
        terracotta: {
          DEFAULT: '#e76f51',
          dark: '#c85338',
          light: '#f4a261',
        },
        sand: {
          DEFAULT: '#ffca98',
          light: '#ffe3cb',
          dark: '#dca676',
        },
        paper: {
          DEFAULT: '#fdfae7',
          high: '#f7f2d5',
          low: '#fffdf5',
        },
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        label: ['Space Grotesk', 'monospace'],
      },
    },
  },
  plugins: [],
}
