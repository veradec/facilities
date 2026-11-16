import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f0f7f4", 600: "#1f6f5b", 700: "#195847", 800: "#134136" }
      }
    }
  },
  plugins: []
} satisfies Config;
