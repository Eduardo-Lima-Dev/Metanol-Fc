/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0C0C0C",
        gold: "#D8A73C",
        cream: "#F4EDE0",
        charcoal: "#1A1A1A",
      },
    },
  },
  plugins: [],
};
