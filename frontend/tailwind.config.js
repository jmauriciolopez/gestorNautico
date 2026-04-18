// tailwind.config.js
// Pegá esto en tu configuración de Tailwind para que funcionen los tokens del dashboard

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // usa la clase "dark" en el <html> para tu toggle
  theme: {
    extend: {
      colors: {
        // Superficies (se adaptan al tema claro/oscuro via CSS vars)
        "surface-primary":   "var(--surface-primary)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-tertiary":  "var(--surface-tertiary)",

        // Texto
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary":  "var(--text-tertiary)",

        // Bordes
        "border-subtle": "var(--border-subtle)",
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        // Alternativa: 'Geist', 'Plus Jakarta Sans', 'Outfit'
        // Importá desde Google Fonts en tu index.html:
        // <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
      },
    },
  },
  plugins: [],
};

