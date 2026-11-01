import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { PlanProvider } from "../lib/persistence/PlanContext";
import { ReplanningModal } from "../components/replanning/ReplanningModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EVENTPILOT — Bauhaus Geometric Event Planning Architecture",
  description:
    "Constructivist GenAI-powered event planning assistant with deterministic constraint validation, budget optimization, dependency-aware scheduling, and adaptive replanning.",
  keywords: [
    "Event Planning",
    "GenAI",
    "Bauhaus Design",
    "Budget Intelligence",
    "Timeline Management",
    "Adaptive Replanning",
    "Pune Birthday",
    "Vegetarian Catering",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-screen flex flex-col bg-bauhausCanvas text-bauhausBlack antialiased font-sans relative selection:bg-bauhausRed selection:text-white">
        {/* Accessible Skip Link (Bauhaus Primary Red) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-6 focus:py-3 focus:bg-bauhausRed focus:text-white focus:border-4 focus:border-black focus:shadow-hard-4 focus:text-xs focus:font-black focus:uppercase focus:tracking-widest"
        >
          Skip to main content
        </a>

        <div className="relative z-10 flex flex-col min-h-screen">
          <PlanProvider>
            {children}
            <ReplanningModal />
          </PlanProvider>
        </div>
      </body>
    </html>
  );
}
