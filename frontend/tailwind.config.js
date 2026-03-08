/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        accent: '#00d4ff',
        fraud: '#ff2d55',
        safe: '#00ff88',
        navy: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1f2937',
        }
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        syne: ['Syne', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
