/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F3F4F6',
        card: '#FFFFFF',
        ink: '#1F2937',
        muted: '#6B7280',
        accent: '#6366F1',
        accentSoft: '#EEF2FF'
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.04)',
        glow: '0 0 0 3px rgba(99,102,241,0.18)'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
