/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-orbitron)"],
      },
      colors: {
        rayo: {
          // ELIMINAMOS EL NEGRO PURO
          // black: "#050505", -> Viejo
          // dark: "#0a0a0a",  -> Viejo

          // NUEVA PALETA "OBSIDIANA"
          black: "#09090b", // Un negro rico (Zinc-950), no puro.
          dark: "#121217", // Un gris muy oscuro para tarjetas/secciones.
          surface: "#1e1e24", // Para bordes o elementos elevados.

          // Mantenemos tus rojos
          red: "#FF2E2E",
          crimson: "#D40000",
          muted: "#3d1111",
        },
        animation: {
          "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "pulse-slower": "pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
      },
    },
  },
  plugins: [],
};
