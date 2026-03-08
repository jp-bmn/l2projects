/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        grass: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
          light: '#4ade80',
          deep: '#15803d',
        },
        'sky-teal': '#8fb3c0',
        'neutral-blue': '#64b5f6',
        blueprint: {
          navy: '#0f2942',
          blue: '#1565C0',
          line: '#4a9fd4',
          grid: '#1a3a5c',
        },
        'device-gray': '#e8edf2',
      },
      animation: {
        'wire-flow': 'wireFlow 6s linear infinite',
        'wire-flow-slow': 'wireFlow 10s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        wireFlow: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
