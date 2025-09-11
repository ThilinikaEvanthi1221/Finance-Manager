// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        darkGreen: "#064e3b",    // earthy green for light mode
        lightGreen: "#22c55e",   // neon green for dark mode
      },
    },
  },
  plugins: [],
}