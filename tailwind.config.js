/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      colors: {
        notion: {
          bg: '#FFFFFF',
          darkBg: '#191919',
          card: '#F7F6F3',
          darkCard: '#202020',
          border: '#E3E2E0',
          darkBorder: '#2F2F2F',
          text: '#37352F',
          darkText: '#D4D4D4',
          grayTag: { bg: '#F1F1EF', text: '#5A5A5A', darkBg: '#373737', darkText: '#9B9B9B' },
          brownTag: { bg: '#F4EEEE', text: '#78350F', darkBg: '#43291F', darkText: '#D97706' },
          orangeTag: { bg: '#FAEBDD', text: '#C2410C', darkBg: '#49290E', darkText: '#F97316' },
          yellowTag: { bg: '#FBF3DB', text: '#854D0E', darkBg: '#403512', darkText: '#FACC15' },
          greenTag: { bg: '#EDF3EC', text: '#15803D', darkBg: '#1C3829', darkText: '#4ADE80' },
          blueTag: { bg: '#E7F3F8', text: '#1D4ED8', darkBg: '#183347', darkText: '#60A5FA' },
          purpleTag: { bg: '#F1F0F7', text: '#6B21A8', darkBg: '#2B1E3A', darkText: '#C084FC' },
          pinkTag: { bg: '#F7EEF3', text: '#BE185D', darkBg: '#3B1827', darkText: '#F472B6' },
          redTag: { bg: '#FDEBEC', text: '#B91C1C', darkBg: '#3E1B18', darkText: '#F87171' },
        }
      },
      boxShadow: {
        'apple': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
        'apple-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.08)',
        'apple-dark': '0 4px 20px 0 rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
