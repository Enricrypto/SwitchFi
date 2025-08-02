const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './*{js,ts,jsx,tsx}',
  ],
  safelist: ['bg-weird-lime', 'text-weird-purple'], // if weird is top-level
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        cosmic: {
          bg: '#120023',
          bgAlt: '#1C012D',
          primary: '#AB37FF',
          primaryHover: '#C155FF',
          accent: '#FFD859',
          green: '#00FF94',
          text: '#FAFAFA',
          textSubtle: '#AAAAAA',
        },
        weird: {
          lime: '#A4FF00',
          purple: '#BF00FF',
        },
      },
      // ...
    },
  },
  plugins: [],
});
