import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1420",
          light: "#171E2E",
          card: "#1B2436",
        },
        paper: {
          DEFAULT: "#EDEEF2",
          dim: "rgba(237,238,242,0.65)",
          faint: "rgba(237,238,242,0.4)",
        },
        gold: {
          DEFAULT: "#D4A24C",
          light: "#E4BC77",
        },
        teal: {
          DEFAULT: "#4FA8A3",
          light: "#6FC2BD",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
