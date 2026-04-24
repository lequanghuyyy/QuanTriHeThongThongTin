import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
        },
        secondary: {
          light: '#E8E8E8',
          DEFAULT: '#777777',
          dark: '#474747',
          lighter: '#C6C6C6',
        },
        background: '#F9F9F9',
        danger: {
          DEFAULT: '#FF0000',
          dark: '#BA1A1A',
        },
        info: '#004070',
        success: '#059668',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        card: '8px',
        button: '24px',
        input: '4px',
        image: '24px',
      },
      spacing: {
        xs: '8px',
        md: '16px',
        section: '160px',
      }
    },
  },
  plugins: [],
} satisfies Config
