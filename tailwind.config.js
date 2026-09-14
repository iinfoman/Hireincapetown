/** Tokens mirror design/_tokens.md. Change them in one place only. */
export default {
  content: ['./src/**/*.{js,jsx}', './scripts/**/*.mjs'],
  theme: {
    extend: {
      colors: {
        ink:        { DEFAULT: '#161C24', 2: '#5A6472', 3: '#8B94A1' },
        protea:     { DEFAULT: '#A8325A', deep: '#7E2242', tint: '#FBEEF3' },
        trust:      { DEFAULT: '#0F6B4F', tint: '#E7F2EC' },
        open:       '#1FA45E',
        whatsapp:   '#25D366',
        star:       '#E8A317',
        surface:    '#F2F3F5',
        line:       { DEFAULT: '#E4E7EC', strong: '#D6DBE2' },
      },
      fontFamily: {
        dsp:  ['"Bricolage Grotesque"', 'Karla', 'system-ui', 'sans-serif'],
        body: ['Karla', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: { card: '16px', tile: '12px', ctl: '13px' },
      minHeight:    { tap: '44px' },
    },
  },
  plugins: [],
};
