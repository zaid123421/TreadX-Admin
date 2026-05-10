/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        success: "var(--success)",
        warning: "var(--warning)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: "var(--font-family-sans)",
        arabic: "var(--font-family-arabic)",
        mono: "var(--font-family-mono)",
      },
      spacing: {
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        10: "var(--spacing-10)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
        20: "var(--spacing-20)",
        24: "var(--spacing-24)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        moderate: "var(--duration-moderate)",
        slow: "var(--duration-slow)",
        deliberate: "var(--duration-deliberate)",
        lazy: "var(--duration-lazy)",
        crawl: "var(--duration-crawl)",
      },
      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        decelerate: "var(--easing-decelerate)",
        accelerate: "var(--easing-accelerate)",
        spring: "var(--easing-spring)",
        sharp: "var(--easing-sharp)",
      },
    },
  },
}
