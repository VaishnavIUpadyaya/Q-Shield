/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        cyber: {
          bg: "#05070f",
          card: "#0b1120",
          border: "#1e293b",
          hover: "#131d33",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};
