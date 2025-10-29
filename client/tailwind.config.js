/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX files in the src folder
    "./public/index.html",      // Scan the main HTML file
  ],
  theme: {
    extend: {
      // You can add custom fonts, colors, or animations here
      fontFamily: {
        // This adds the 'Inter' font we linked in index.html
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // Optional: A plugin for nicer default form styles
  ],
}