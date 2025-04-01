/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./node_modules/tw-elements-react/dist/js/**/*.js"
  ],
  theme: {
    extend: {
      
      fontSize: {
        "1xs": ["10px", "12px"],
        "2xs": ["9px", "12px"],
      },
      fontFamily:{
        // 'segoe': ['Segoe UI', 'sans-serif'],
        // 'display': ['Segoe UI', 'sans-serif'],
        // 'body': ['Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        '4xl': [
            '0px 0px 40px rgba(0, 0, 0, 0.1)',
            '0px 0px 10px rgba(0, 0, 0, 0.1)'
        ]
      },
      colors: {
        "primary": "var(--primary-color)",
        "secondary": "var(--secondary-color)",
      }
    },
  },
  plugins: [require("tw-elements-react/dist/plugin.cjs")],
};
 
 