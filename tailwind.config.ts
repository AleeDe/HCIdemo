import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glass: "0 12px 45px rgba(7, 18, 28, 0.2)",
        note: "0 12px 28px rgba(45, 29, 0, 0.2)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.2), transparent 45%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.15), transparent 40%)",
      },
    },
  },
  plugins: [],
};

export default config;
