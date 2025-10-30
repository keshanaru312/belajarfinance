/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          heading: ["var(--font-space-grotesk)", "sans-serif"],
          sans: ["var(--font-inter)", "sans-serif"],
        },
        colors: {
          background: "var(--background)",
          foreground: "var(--foreground)",
          surface: "var(--surface)",
          "surface-secondary": "var(--surface-secondary)",
          border: "var(--border)",
          "text-primary": "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          accent: "var(--accent)",
          "accent-secondary": "var(--accent-secondary)",
        },
      },
    },
    darkMode: ["class", '[data-theme="dark"]'],
    plugins: [],
  };
  