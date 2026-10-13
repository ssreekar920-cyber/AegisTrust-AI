/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        panel: "#0f172a",
        borderDark: "#1e293b",
        elevated: "#1e293b",
        accent: "#06b6d4",
        danger: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(6, 182, 212, 0.15)",
        glowDanger: "0 0 24px rgba(239, 68, 68, 0.2)",
      },
    },
  },
  plugins: [],
};
