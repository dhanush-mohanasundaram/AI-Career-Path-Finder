import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: '#6366f1',
        'primary-light': '#eef2ff',
        accent: '#0ea5e9',
        success: '#10b981',
        warn: '#f59e0b',
      },
    },
  },
  plugins: [],
} satisfies Config
