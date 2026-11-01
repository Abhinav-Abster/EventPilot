"use client";

import React, { useState } from "react";
import { Bookmark, Sparkles, Info, AlertTriangle } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { CreativeIdeaCategory } from "../../lib/types/event";
import { formatINR } from "../../lib/budget/moneyUtils";

const CATEGORY_NAMES: Record<CreativeIdeaCategory, string> = {
  theme: "Themes & Aesthetics",
  decor: "Decorations & Ambience",
  menu: "Menus & Fusion Counters",
  activities: "Interactive Games & Music",
  invitation: "Invitations & Stationery",
  return_gifts: "Return Gifts & Favors",
  schedule: "Event Flow & Run of Show",
  weather_contingency: "Weather & Contingency",
};

export function CreativeIdeasView() {
  const { plan, toggleSaveIdea } = usePlan();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredIdeas =
    selectedCategory === "all"
      ? plan.ideas
      : plan.ideas.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-12 pb-12">
      {/* Editorial Bauhaus Header */}
      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-hard-8 space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black">
          <span className="w-3.5 h-3.5 rounded-full bg-bauhausRed border-2 border-black inline-block" />
          <span>MODULE 05 / CURATED EXPERIENCES & AESTHETIC DIRECTIVES</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase text-black">
          CREATIVE ATELIER
        </h1>
        <p className="font-medium text-base text-bauhausBlack max-w-2xl leading-relaxed">
          Bespoke thematic installations, artisanal culinary pairings, and geometric entertainment
          designed exclusively around non-negotiable constraints.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
          AESTHETIC DOMAINS:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-bauhausRed text-white font-black shadow-hard-4"
                : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
            }`}
          >
            ALL CONCEPTS ({plan.ideas.length})
          </button>
          {Object.entries(CATEGORY_NAMES).map(([key, label]) => {
            const count = plan.ideas.filter((i) => i.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
                  selectedCategory === key
                    ? "bg-bauhausRed text-white font-black shadow-hard-4"
                    : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
                }`}
              >
                {label.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4px Heavy Divider */}
      <div className="w-full border-t-4 border-black" />

      {/* Ideas Grid: Bauhaus Poster Spreads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredIdeas.map((idea, idx) => {
          // Rotating primary headers
          const headerBg =
            idx % 3 === 0
              ? "bg-bauhausRed text-white"
              : idx % 3 === 1
                ? "bg-bauhausBlue text-white"
                : "bg-bauhausYellow text-black";

          return (
            <div
              key={idea.id}
              className="card-bauhaus bg-white border-4 border-black shadow-hard-8 flex flex-col justify-between overflow-hidden"
            >
              {/* Poster Color-Blocked Top Bar */}
              <div
                className={`p-4 border-b-4 border-black flex items-center justify-between ${headerBg}`}
              >
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-black">
                  <span>CONCEPT 0{idx + 1}</span>
                  <span>/</span>
                  <span>{CATEGORY_NAMES[idea.category]}</span>
                </div>
                <button
                  onClick={() => toggleSaveIdea(idea.id)}
                  className={`p-1.5 border-2 border-black transition-all shadow-hard-2 ${
                    idea.isSaved
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-bauhausYellow"
                  }`}
                  title={idea.isSaved ? "Curated Concept" : "Bookmark this concept"}
                >
                  <Bookmark
                    size={15}
                    strokeWidth={2.5}
                    className={idea.isSaved ? "fill-white" : ""}
                  />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
                  {idea.title}
                </h2>

                <p className="font-medium text-sm text-bauhausBlack leading-relaxed">
                  {idea.description}
                </p>

                {/* Justification Box in Light Yellow */}
                <div className="p-4 border-2 border-black bg-bauhausLightYellow shadow-hard-3 space-y-1">
                  <div className="font-mono text-micro uppercase tracking-wider font-black text-black flex items-center gap-1.5">
                    <Sparkles size={13} strokeWidth={2.5} className="text-bauhausRed" />
                    <span>CURATORIAL JUSTIFICATION</span>
                  </div>
                  <p className="font-bold text-xs text-black leading-relaxed">
                    &ldquo;{idea.whyItFits}&rdquo;
                  </p>
                </div>

                {/* Implementation Steps */}
                {idea.implementationSteps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t-2 border-black">
                    <span className="font-mono text-tiny uppercase tracking-wider font-black text-black block">
                      EXECUTION SEQUENCE:
                    </span>
                    <ol className="space-y-1 text-xs font-mono font-bold text-black list-decimal list-inside pl-1">
                      {idea.implementationSteps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Constraints & Trade-Offs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t-2 border-black text-xs font-mono">
                  {idea.constraints.length > 0 && (
                    <div className="text-black">
                      <span className="text-micro uppercase tracking-wider font-black text-black block mb-0.5 flex items-center gap-1">
                        <Info size={12} strokeWidth={2.5} className="text-bauhausBlue" />{" "}
                        CONSTRAINT:
                      </span>
                      <span className="font-bold">{idea.constraints[0]}</span>
                    </div>
                  )}
                  {idea.tradeOffs.length > 0 && (
                    <div className="text-black">
                      <span className="text-micro uppercase tracking-wider font-black text-black block mb-0.5 flex items-center gap-1">
                        <AlertTriangle size={12} strokeWidth={2.5} className="text-bauhausRed" />{" "}
                        TRADE-OFF:
                      </span>
                      <span className="font-bold">{idea.tradeOffs[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Cost Card */}
              <div className="p-6 bg-bauhausCanvas border-t-4 border-black flex items-center justify-between font-mono">
                <div>
                  <span className="text-micro font-bold text-black/70 block uppercase tracking-wider">
                    BUDGET PROJECTION
                  </span>
                  <span className="font-black text-black text-base">
                    {idea.costRangeText || formatINR(idea.estimatedCostMinor)}
                  </span>
                </div>

                <span className="text-micro uppercase tracking-widest bg-white border-2 border-black px-3 py-1 text-black font-black shadow-hard-2">
                  DESIGN READY
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
