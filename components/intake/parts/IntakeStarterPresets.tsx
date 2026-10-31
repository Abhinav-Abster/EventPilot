import React from "react";

export interface StarterPrompt {
  title: string;
  query: string;
  accent: string;
}

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: "PUNE BIRTHDAY SPECIFICATION",
    query:
      "I'm planning my sister's birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food.",
    accent: "bg-[#D02020]",
  },
  {
    title: "ECO-MODERN MATRIMONIAL",
    query:
      "Planning an eco-friendly intimate wedding in Pune for 100 guests with a budget of ₹3,00,000. Vegetarian buffet and day-time outdoor lawn.",
    accent: "bg-[#1040C0]",
  },
  {
    title: "SOCIETY CULTURAL GALA",
    query:
      "Organizing a Diwali community cultural evening for 150 society members in Pune with ₹75,000 budget. Pure veg snacks, stage performances, and rangoli.",
    accent: "bg-[#F0C020]",
  },
];

interface IntakeStarterPresetsProps {
  onSelectPrompt: (query: string) => void;
}

export function IntakeStarterPresets({ onSelectPrompt }: IntakeStarterPresetsProps) {
  return (
    <div className="space-y-3">
      <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
        CURATED ARCHETYPES & PRESETS:
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STARTER_PROMPTS.map((starter, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(starter.query)}
            className="card-bauhaus text-left p-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_black] hover:bg-[#FFF9C4] transition-all flex flex-col justify-between space-y-4 relative"
          >
            <span className={`w-3 h-3 ${starter.accent} border-2 border-black absolute top-4 right-4`} />
            <div className="border-b-2 border-black pb-2">
              <span className="font-display font-black text-sm uppercase tracking-tight text-black block">
                {starter.title}
              </span>
              <span className="font-mono text-[10px] font-bold text-black/60 uppercase">
                PRESET 0{idx + 1}
              </span>
            </div>
            <p className="font-medium text-xs leading-relaxed text-black/80">
              &ldquo;{starter.query}&rdquo;
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
