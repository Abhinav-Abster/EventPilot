import type { Metadata } from "next";
import "./globals.css";
import { PlanProvider } from "../lib/persistence/PlanContext";
import { ReplanningModal } from "../components/replanning/ReplanningModal";

export const metadata: Metadata = {
  title: "EventPilot — Plan Smarter. Spend Better. Celebrate Without Chaos.",
  description:
    "GenAI-powered event planning assistant with deterministic constraint validation, budget optimization, dependency-aware scheduling, and adaptive replanning.",
  keywords: [
    "Event Planning",
    "GenAI",
    "Budget Intelligence",
    "Timeline Management",
    "Adaptive Replanning",
    "Pune Birthday",
    "Vegetarian Catering",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 antialiased selection:bg-gold-200 selection:text-forest-950 font-sans">
        <PlanProvider>
          {children}
          <ReplanningModal />
        </PlanProvider>
      </body>
    </html>
  );
}
