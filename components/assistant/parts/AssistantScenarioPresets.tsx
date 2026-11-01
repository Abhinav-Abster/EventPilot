import React from "react";

export interface QuickScenario {
  title: string;
  query: string;
}

export const QUICK_SCENARIOS: QuickScenario[] = [
  {
    title: "BUDGET CAP: ₹30,000",
    query: "My budget is now ₹30,000.",
  },
  {
    title: "GUEST CENSUS: +20 PAX",
    query: "We have 20 additional guests.",
  },
  {
    title: "INDOOR RELOCATION",
    query: "Move the party indoors due to rain forecast.",
  },
  {
    title: "CATERER CANCELLATION",
    query: "The caterer cancelled at the last minute.",
  },
  {
    title: "PRESERVE DECOR MANDATE",
    query: "Keep the decorations but reduce other expenses.",
  },
  {
    title: "POSTPONE BY 7 DAYS",
    query: "The event is now next Saturday.",
  },
];

interface AssistantScenarioPresetsProps {
  onSelectScenario: (query: string) => void;
}

export function AssistantScenarioPresets({ onSelectScenario }: AssistantScenarioPresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-black inline-block" />
        <span className="font-mono text-xs uppercase tracking-widest font-bold text-black">
          DISRUPTION SCENARIO PRESETS:
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_SCENARIOS.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => onSelectScenario(sc.query)}
            className="text-left p-3.5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_black] hover:bg-[#F0C020] hover:text-black btn-bauhaus font-mono text-xs group transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px] block truncate">
                {sc.title}
              </span>
              <span
                className={`w-2 h-2 border border-black ${
                  idx % 3 === 0
                    ? "bg-[#D02020] rounded-full"
                    : idx % 3 === 1
                      ? "bg-[#1040C0]"
                      : "bg-[#F0C020] shape-triangle"
                }`}
              />
            </div>
            <span className="font-sans text-[11px] text-gray-700 group-hover:text-black block truncate">
              &ldquo;{sc.query}&rdquo;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
