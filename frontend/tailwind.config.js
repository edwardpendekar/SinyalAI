/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        foreground: '#f8fafc',
        card: 'rgba(17, 24, 39, 0.7)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: {
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glow': 'radial-gradient(circle at 50% -20%, rgba(139, 92, 246, 0.15), transparent 80%)'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
