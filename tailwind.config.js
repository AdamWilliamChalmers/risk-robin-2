/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pastel scheme inspired by the original card art
        pastel: {
          peach: "#F4D1B7",
          peachLight: "#FCE9D6",
          cream: "#FFF6EC",
          mint: "#DCEFD8",
          sky: "#D5E5F0",
          lilac: "#E4D9EE",
          rose: "#F7D7DE",
        },
        category: {
          economy: "#E94B7B",   // pink - Thriving Visitor Economy
          jobs: "#F39A2C",      // orange - Fair Work
          investment: "#4FB7E0",// blue - Ongoing Investment
          netzero: "#7FB93C",   // green - Net Zero
          quality: "#7C3E97",   // purple - Quality of Life
        },
        robinOrange: "#D24B25",
      },
      fontFamily: {
        display: ['"Fredoka"', '"Nunito"', "system-ui", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -10px rgba(0,0,0,0.25)",
        glow: "0 0 0 4px rgba(210, 75, 37, 0.35), 0 0 30px rgba(210, 75, 37, 0.45)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(210, 75, 37, 0.45)" },
          "50%":      { boxShadow: "0 0 0 10px rgba(210, 75, 37, 0.0)" },
        },
        pop: {
          "0%":   { transform: "scale(0.6)", opacity: "0" },
          "60%":  { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.2s ease-out infinite",
        pop: "pop 350ms cubic-bezier(.2,.8,.2,1.2)",
        fadeIn: "fadeIn 400ms ease-out both",
      },
    },
  },
  plugins: [],
};
