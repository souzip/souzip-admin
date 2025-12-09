/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f0',
          100: '#ffe8dc',
          200: '#ffcdb3',
          300: '#ffb08a',
          400: '#ff9461',
          500: '#ff7738',
          600: '#e66a32',
          700: '#cc5e2c',
          800: '#b35127',
          900: '#994421',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      borderRadius: {
        'sm': '5px',
        'DEFAULT': '10px',
        'lg': '20px',
      },
    },
  },
  plugins: [],
}
