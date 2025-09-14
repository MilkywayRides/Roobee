import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '20%, 100%': { transform: 'translateX(100%)' },
        },
        first: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate3d(120px, -80px, 0) scale(1.1) rotate(30deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        },
        second: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate3d(-160px, 60px, 0) scale(0.9) rotate(-20deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        },
        third: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate3d(90px, 100px, 0) scale(1.05) rotate(15deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        },
        fourth: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate3d(-100px, -120px, 0) scale(1.1) rotate(25deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        },
        fifth: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate3d(140px, 40px, 0) scale(0.95) rotate(-15deg)' },
          '100%': { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "shine": "shine 3s ease-in-out infinite",
        first: "first 16s ease-in-out infinite",
        second: "second 20s ease-in-out infinite",
        third: "third 18s ease-in-out infinite",
        fourth: "fourth 22s ease-in-out infinite",
        fifth: "fifth 19s ease-in-out infinite",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config 