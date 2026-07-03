import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        automotive: {
          black: "#050505",
          anthracite: "#18181B",
          red: "#ffc10a",
        },
      },
    },
  },
};

export default config;
