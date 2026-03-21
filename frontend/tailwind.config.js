/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: '#060810',
        abyss: '#0a0d1a',
        surface: '#0f1426',
        panel: '#141928',
        border: '#1e2538',
        'border-bright': '#2a3350',
        electric: '#4f8ef7',
        'electric-dim': '#3a6fd4',
        'electric-glow': '#6aa3ff',
        cyan: '#22d3ee',
        'cyan-dim': '#06b6d4',
        neon: '#a78bfa',
        'neon-dim': '#7c5cbf',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        'text-primary': '#e8eaf6',
        'text-secondary': '#8892b0',
        'text-muted': '#4a5580',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse at center, rgba(79,142,247,0.15) 0%, transparent 70%)',
        'electric-gradient': 'linear-gradient(135deg, #4f8ef7 0%, #22d3ee 100%)',
        'neon-gradient': 'linear-gradient(135deg, #a78bfa 0%, #4f8ef7 100%)',
      },
      boxShadow: {
        'glow-electric': '0 0 20px rgba(79,142,247,0.3), 0 0 60px rgba(79,142,247,0.1)',
        'card': '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}
