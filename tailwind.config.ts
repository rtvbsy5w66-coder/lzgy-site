import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors using CSS variables
        'theme': {
          'bg': 'var(--theme-bg)',
          'text': 'var(--theme-text)',
          'card-bg': 'var(--theme-card-bg)',
          'border': 'var(--theme-border)',
          'input': 'var(--theme-input)',
          'gradient-from': 'var(--theme-gradient-from)',
          'gradient-to': 'var(--theme-gradient-to)',
          'accent': 'var(--theme-accent)',
        },
        // Legacy colors (keeping for backward compatibility)
        primary: {
          DEFAULT: "#1a56db",
          dark: "#1e429f",
          light: "#60a5fa",
        },
        background: {
          DEFAULT: "#ffffff",
          dark: "#f3f4f6",
        },
        text: {
          DEFAULT: "#111827",
          light: "#374151",
        },
        // Sötét téma színei
        dark: {
          primary: {
            DEFAULT: "#60a5fa",
            dark: "#3b82f6",
            light: "#93c5fd",
          },
          background: {
            DEFAULT: "#111827",
            dark: "#1f2937",
          },
          text: {
            DEFAULT: "#f9fafb",
            light: "#e5e7eb",
          },
        },
      },
      backgroundImage: {
        'theme-gradient': 'var(--theme-gradient)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
