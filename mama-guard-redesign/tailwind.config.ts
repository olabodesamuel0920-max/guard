import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        rose: {
          50: "#FFF5F5", 100: "#FFE8E8", 200: "#FFD1D1",
          300: "#FFAAAA", 400: "#FF7A7A", 500: "#F05A6D",
          600: "#E04459", 700: "#B8334A", 800: "#962D3E", 900: "#7A2938",
        },
        sage: {
          50: "#F4F7F4", 100: "#E3EBE3", 200: "#C7D7C7",
          300: "#9EB99E", 400: "#729772", 500: "#527A52",
          600: "#3D613D", 700: "#2F4D2F",
        },
        warm: {
          50: "#FAF8F6", 100: "#F0EDE9", 200: "#E2DCD6",
          300: "#CFC7BE", 400: "#B0A69C", 500: "#968A80",
          600: "#7D7169", 700: "#665C55", 800: "#544B46", 900: "#3D3633",
        },
      },
      borderRadius: { "2xl": "16px", "3xl": "20px", "4xl": "24px" },
    },
  },
  plugins: [],
};
export default config;
