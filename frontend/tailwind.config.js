/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mf: {
          'green-950': '#0b1712',
          'green-900': '#152a1e',
          'green-800': '#1e3d2a',
          'green-700': '#2e5c3e',
          'green-400': '#5a9070',
          'caribe':    '#00b894',
          'jade':      '#55d8b4',
          'caribe-lt': '#c0f0e4',
          'caribe-xs': '#e4f8f3',
          'caribe-dk': '#009a7a',
          'off-white': '#f0f5f3',
          'border-lt': '#d0e0da',
          'muted-lt':  '#6a8880',
          'text-lt':   '#2a3a36',
          'black':     '#111816',
          'footer':    '#060e0a',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'caribe':    '0 4px 20px rgba(0,184,148,0.25)',
        'caribe-lg': '0 8px 32px rgba(0,184,148,0.30)',
        'mf-sm':     '0 2px 8px rgba(11,23,18,0.08)',
        'mf-md':     '0 4px 16px rgba(11,23,18,0.10)',
        'mf-lg':     '0 8px 32px rgba(11,23,18,0.14)',
      },
    },
  },
  plugins: [],
};
