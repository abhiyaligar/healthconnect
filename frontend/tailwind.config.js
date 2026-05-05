/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#f7f9fc',
        surface: '#ffffff',
        primary: {
          50: '#e5f5ff',
          100: '#c0e8ff',
          200: '#89d0f3',
          300: '#7bd1fa',
          400: '#6cc3eb',
          500: '#006382',
          600: '#005672',
          700: '#004a62',
          800: '#003d51',
          900: '#003041',
        },
        tertiary: {
          100: '#fbefff',
          200: '#f0dbff',
          300: '#dcb8ff',
          400: '#d6adff',
          500: '#6f4b94',
          600: '#623f87',
          700: '#56337a',
        },
        navy: {
          50: '#eff1f4',
          100: '#e0e3e5',
          300: '#bfc8ce',
          400: '#70787e',
          500: '#40484d',
          700: '#2d3133',
          800: '#191c1e',
          900: '#0f1112',
        },
        status: {
          open: '#22c55e',
          warning: '#f59e0b',
          error: '#ba1a1a',
          errorBg: '#ffdad6',
        }
      },
      boxShadow: {
        'skyline': '0 10px 30px rgba(25, 28, 30, 0.08)',
      }
    },
  },
  plugins: [],
}
