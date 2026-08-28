/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        obsidian: {
          950: "#06080D",
          900: "#0A0E17",
          850: "#0F1420",
          800: "#141B2B",
          700: "#1E273D",
          600: "#2B3754",
        },
        quantum: {
          cyan: "#00F2FE",
          blue: "#4FACFE",
          indigo: "#6366F1",
          purple: "#A855F7",
          violet: "#8B5CF6",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B",
        },
      },
      boxShadow: {
        "quantum-glow": "0 0 40px -10px rgba(0, 242, 254, 0.25)",
        "purple-glow": "0 0 40px -10px rgba(168, 85, 247, 0.25)",
        "glass-card": "0 20px 50px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
