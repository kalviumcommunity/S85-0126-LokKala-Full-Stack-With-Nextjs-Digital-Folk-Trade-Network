import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        brand: { light: "#fb923c", DEFAULT: "#f97316", dark: "#ea580c" },
        surface: { light: "#f8fafc", dark: "#0b1224" },
        text: { base: "#0f172a", muted: "#334155", onDark: "#e5e7eb" },
        accent: { from: "#f97316", via: "#ef4444", to: "#a855f7" },
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      boxShadow: {
        glow: "0 15px 40px rgba(249, 115, 22, 0.28)",
      },
      borderRadius: {
        xl: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
