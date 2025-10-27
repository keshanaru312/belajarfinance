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
        },
      },
    },
    darkMode: "media", // or "class" if you prefer manual toggle later
    plugins: [],
  };
  