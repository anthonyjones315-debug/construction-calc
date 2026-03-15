import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      colors: {
        steelworks: {
          900: "#05070a",
          700: "#101315",
        },
        rust: {
          DEFAULT: "#f7941d",
          dark: "#d06a18",
          accent: "#f9a15a",
        },
      },
    },
  },
} satisfies Config;

export default config;
