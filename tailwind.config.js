/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legendary: '#FFD700',
        epic: '#C0C0C0',
        rare: '#CD7F32',
        common: '#87CEEB',
        basic: '#808080',
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        neon: '#00ff88',
        danger: '#ff0040'
      },
      fontFamily: {
        'hebrew': ['Arial', 'sans-serif'],
        'impact': ['Impact', 'Arial Black', 'sans-serif']
      },
      animation: {
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pack-open': 'packOpen 1s ease-out'
      },
      keyframes: {
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        packOpen: {
          '0%': { transform: 'scale(1) rotateY(0deg)' },
          '50%': { transform: 'scale(1.1) rotateY(180deg)' },
          '100%': { transform: 'scale(1) rotateY(360deg)' }
        }
      }
    },
  },
  plugins: [],
}