import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css}"
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          accent: "#FF6B1A",
          light: "#FF8C42",
          dark: "#CC4E00"
        },
        dark: {
          bg: "#080808",
          surface: "#111111",
          card: "#161616",
          border: "#1f1f1f"
        }
      },
      fontFamily: {
        bebas: ["Bebas Neue", "cursive"],
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
