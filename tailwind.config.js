/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // Escanea la carpeta app
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Escanea la carpeta components
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-orbitron)'],
      },
      colors: {
        rayo: {
          black: "#050505",
          dark: "#0a0a0a",
          red: "#FF2E2E",
          crimson: "#D40000",
          muted: "#3d1111",
        },
      },
    },
  },
  plugins: [],
};