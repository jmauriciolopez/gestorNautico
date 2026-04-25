export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
          elevated: "var(--bg-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
          inverse: "var(--text-inverse)",
        },
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          strong: "var(--border-strong)",
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          teal: "var(--accent-teal)",
          indigo: "var(--accent-indigo)",
          purple: "var(--accent-purple)",
          amber: "var(--accent-amber)",
          red: "var(--accent-red)",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      borderRadius: {
        ui: "12px",
        card: "18px",
      },
    },
  },
  plugins: [],
};