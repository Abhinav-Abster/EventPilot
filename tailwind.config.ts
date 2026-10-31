import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F0F0F0",
        foreground: "#121212",
        bauhausRed: "#D02020",
        bauhausBlue: "#1040C0",
        bauhausYellow: "#F0C020",
        bauhausBlack: "#121212",
        bauhausWhite: "#FFFFFF",
        bauhausCanvas: "#F0F0F0",
        bauhausMuted: "#E0E0E0",
        bauhausLightYellow: "#FFF9C4",

        // Primary color mappings
        primary: {
          DEFAULT: "#D02020",
          red: "#D02020",
          blue: "#1040C0",
          yellow: "#F0C020",
        },

        // Safety fallback aliases
        forest: {
          50: "#FFF9C4",
          100: "#F0F0F0",
          200: "#E0E0E0",
          800: "#121212",
          850: "#121212",
          900: "#121212",
          950: "#121212",
        },
        gold: {
          100: "#FFF9C4",
          400: "#F0C020",
          500: "#F0C020",
          600: "#F0C020",
        },
        sand: {
          50: "#F0F0F0",
          100: "#E0E0E0",
          200: "#D0D0D0",
          300: "#B0B0B0",
        },
        mutedForeground: "#525252",
        borderLight: "#D0D0D0",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      borderWidth: {
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
      },
      boxShadow: {
        "hard-sm": "3px 3px 0px 0px #121212",
        "hard-md": "4px 4px 0px 0px #121212",
        "hard-lg": "6px 6px 0px 0px #121212",
        "hard-xl": "8px 8px 0px 0px #121212",
        "hard-red": "4px 4px 0px 0px #D02020",
        "hard-blue": "4px 4px 0px 0px #1040C0",
        "hard-yellow": "4px 4px 0px 0px #F0C020",
        "hard-white": "4px 4px 0px 0px #FFFFFF",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
    },
  },
  plugins: [],
};

export default config;
