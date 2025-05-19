import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: { DEFAULT: "#FF0000" }, // Changed to bright red for testing
        dark: "#232A3C",
        medium: "#18191a",
      },
      screens: {
        mobile: "960px",
        "0.5xl": "1125px",
        "3xl": "2560px",
      },
      maxWidth: {
        "8xl": "1440px",
        "9xl": "1600px",
      },
    },
  },
  plugins: [nextui()],
};

export default config;
