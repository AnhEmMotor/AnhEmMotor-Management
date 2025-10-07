module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'primary-red': '#DC2626',
        'primary-light': '#FEE2E2',
        'dark-text': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  safelist: [
    'bg-transparent',
    'text-white',
    {
      pattern: /^(bg|hover:bg|text)-(green|blue|red|yellow|gray)-(100|500|600|800)$/,
    },
  ],
}
