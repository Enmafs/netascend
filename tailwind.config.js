/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta "Dark Cyber/Terminal"
        base: '#0b0f19',
        surface: '#111827',
        card: '#111827',
        line: '#1f2937',
        cyan: { DEFAULT: '#06b6d4' },
        emerald: { DEFAULT: '#10b981' },
        violet: { DEFAULT: '#8b5cf6' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
