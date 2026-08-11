/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E3EEE7', // Sidebar background/accent
          100: '#C5DCCB', // Accent / Primary Light
          200: '#C5DCCB',
          300: '#5F9F7A', // Primary Green
          400: '#5F9F7A',
          450: '#5F9F7A',
          500: '#5F9F7A',
          600: '#5F9F7A',
          700: '#3F7658', // Dark Green
          800: '#4E8968', // Hover Green
          900: '#3F7658',
          950: '#1F2D24', // Primary Text
        },
        dark: {
          50: '#1F2D24', // Primary Text
          100: '#1F2D24',
          150: '#1F2D24',
          200: '#1F2D24',
          250: '#53665B', // Secondary Text
          300: '#1F2D24',
          400: '#53665B',
          450: '#53665B',
          500: '#53665B',
          550: '#53665B',
          600: '#C9DCCF', // Borders
          700: '#C9DCCF',
          800: '#C9DCCF',
          850: '#C9DCCF',
          900: '#FFFFFF', // Cards
          950: '#EEF5F0', // Soft Background
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-subtle': 'pulse-subtle 3s infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
