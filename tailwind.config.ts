import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FCFCFB",
          100: "#F5F5F3",
          200: "#E9E9E6",
          300: "#D9D9D4",
        },
        ember: {
          50: "#F4F4F2",
          100: "#EBEBE8",
          300: "#C8C8C3",
          500: "#252523",
          600: "#151514",
          700: "#000000",
        },
        ink: {
          400: "#7A817B",
          500: "#69736B",
          600: "#566057",
          700: "#3F4841",
          800: "#313A33",
          900: "#242A25",
          950: "#1B211C",
        },
        gold: {
          300: "#D7D7D2",
          500: "#898983",
          700: "#454542",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans CJK SC",
          "sans-serif",
        ],
        serif: [
          "Songti SC",
          "STSong",
          "Noto Serif CJK SC",
          "SimSun",
          "serif",
        ],
      },
      boxShadow: {
        card: "0 18px 50px -38px rgba(31, 45, 36, 0.38)",
        soft: "0 8px 24px -20px rgba(31, 45, 36, 0.28)",
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        15: "0.15",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        65: "0.65",
        85: "0.85",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.04)" },
        },
      },
      animation: {
        "fade-up": "fade-up 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "soft-pulse": "soft-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
