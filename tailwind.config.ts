import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          accent: "#38D5FF",
          light: "#8BEAFF",
          dark: "#006CFF"
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
        cinzel: ["Cinzel", "serif"],
        "cinzel-decorative": ["Cinzel Decorative", "serif"],
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
        fell: ["IM Fell English", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
