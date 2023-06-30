/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../packages/ui/**/*.{jsx,tsx}",
    "./src/**/*.{jsx,tsx}",
    "!./node_modules", // 👈
  ],
  theme: {
    extend: {
      colors: {},
    },
    colors: {},
  },
  plugins: [],
};
