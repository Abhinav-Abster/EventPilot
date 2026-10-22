"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  Sparkles,
  Bookmark,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  AlertTriangle,
  Info,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { CreativeIdea, CreativeIdeaCategory } from "../../lib/types/event";
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-forest-900">
          Personalized Creative Studio
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Bespoke themes, 100% vegetarian culinary pairing, and anime-inspired interactive entertainment customized to your guest count and budget constraints.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
            selectedCategory === "all"
              ? "bg-forest-900 text-white font-semibold"
              : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
          }`}
        >
          All Concepts ({plan.ideas.length})
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, label]) => {
          const count = plan.ideas.filter((i) => i.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
                selectedCategory === key
                  ? "bg-forest-900 text-white font-semibold"
                  : "bg-white text-stone-600 border border-sand-200 hover:bg-sand-100"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIdeas.map((idea) => {
          return (
            <div
              key={idea.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-sand-200 hover:border-sand-300 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3.5">
                {/* Category & Bookmark */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-sand-100 text-forest-900 px-2.5 py-1 rounded-full">
                    {CATEGORY_NAMES[idea.category]}
                  </span>
                  <button
                    onClick={() => toggleSaveIdea(idea.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      idea.isSaved
                        ? "bg-gold-50 border-gold-300 text-gold-600"
                        : "border-sand-200 text-stone-400 hover:text-stone-700"
                    }`}
                    title={idea.isSaved ? "Saved Idea" : "Bookmark this idea"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${idea.isSaved ? "fill-gold-500" : ""}`}
                    />
                  </button>
                </div>

                <h3 className="text-base font-bold text-forest-900 font-display">
                  {idea.title}
                </h3>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {idea.description}
                </p>

                {/* Why it fits */}
                <div className="p-3 bg-forest-50/60 border border-forest-100 rounded-xl">
                  <div className="text-[11px] font-bold text-forest-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                    <span>Why it fits this event</span>
                  </div>
                  <p className="text-xs text-forest-950/80 leading-normal">
                    {idea.whyItFits}
                  </p>
                </div>

                {/* Implementation Steps */}
                {idea.implementationSteps.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-stone-800 block">
                      Execution Steps:
                    </span>
                    <ol className="space-y-1 text-xs text-stone-600 list-decimal list-inside pl-1">
                      {idea.implementationSteps.map((step, idx) => (
                        <li key={idx} className="leading-normal">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Constraints & Trade-Offs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-sand-100 text-[11px]">
                  {idea.constraints.length > 0 && (
                    <div className="text-stone-600">
                      <span className="font-semibold text-stone-800 block mb-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-stone-400" /> Constraint:
                      </span>
                      <span>{idea.constraints[0]}</span>
                    </div>
                  )}
                  {idea.tradeOffs.length > 0 && (
                    <div className="text-stone-600">
                      <span className="font-semibold text-stone-800 block mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Trade-off:
                      </span>
                      <span>{idea.tradeOffs[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Cost Card */}
              <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">
                    Estimated Cost Range
                  </span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {idea.costRangeText || formatINR(idea.estimatedCostMinor)}
                  </span>
                </div>

                <span className="text-[11px] font-medium text-forest-800 bg-sand-50 px-2.5 py-1 rounded-md border border-sand-200">
                  Concept Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
