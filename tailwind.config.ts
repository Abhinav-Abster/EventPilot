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
        "hard-2": "2px 2px 0px 0px black",
        "hard-3": "3px 3px 0px 0px black",
        "hard-4": "4px 4px 0px 0px black",
        "hard-6": "6px 6px 0px 0px black",
        "hard-8": "8px 8px 0px 0px black",
        "hard-white-2": "2px 2px 0px 0px white",
      },
      fontSize: {
        micro: "10px",
        tiny: "11px",
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
