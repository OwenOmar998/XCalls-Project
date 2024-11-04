/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins'],
      },
      colors: {
        error: '#FD4242',
        gray: {
          10: '#ffffff',
          20: '#f2f2f2',
          30: '#e0e0e0',
          40: '#c2c2c2',
          50: '#9e9e9e',
          60: '#757575',
          70: '#616161',
          80: '#424242',
          90: '#000000',
          100: '#B3B7C6',
          200: '#7D7979',
          300: '#6A6A6A',
          400: '#DADADA',
          500: '#999999',
          600: '#888888',
          700: '#757575',
          800: '#111111',
          900: '#545454',
          950: '#363636',
          1000: '#1B1B1B',
        },
        boxShadow: {
          1: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
        dropShadow: {
          1: '0px 1px 0px #E2E8F0',
        },
      },
      zIndex: {
        999999: '999999',
        99999: '99999',
        9999: '9999',
        999: '999',
        99: '99',
        9: '9',
        1: '1',
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /^bg-/, // This will match any class that starts with "bg-"
    },
    {
      pattern: /^text-/, // This will match any class that starts with "text-"
    },
    {
      pattern: /^border-/, // This will match any class that starts with "border-"
    },
    {
      pattern: /^rounded-/, // This will match any class that starts with "rounded-"
    },
  ],
};
