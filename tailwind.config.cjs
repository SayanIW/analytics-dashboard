module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',
        surface: '#18181b',
        background: '#09090b',
        bordercolor: '#27272a',
        textMain: '#ffffff',
        textMuted: '#a1a1aa',
        accentGreen: '#bef264',
        accentRed: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
