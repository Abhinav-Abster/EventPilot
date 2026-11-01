import React from "react";
import { ALL_BUDGET_CATEGORIES, CATEGORY_LABELS } from "../../../lib/budget/budgetEngine";
import { formatINR } from "../../../lib/budget/moneyUtils";
import { BudgetSummary } from "../../../lib/types/event";

interface BudgetCategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalItemsCount: number;
  summary: BudgetSummary;
}

export function BudgetCategoryFilter({
  selectedCategory,
  onSelectCategory,
  totalItemsCount,
  summary,
}: BudgetCategoryFilterProps) {
  return (
    <div className="space-y-3">
      <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
        CATEGORY LEDGERS:
      </span>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => onSelectCategory("all")}
          className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
            selectedCategory === "all"
              ? "bg-bauhausRed text-white font-black shadow-hard-4"
              : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
          }`}
        >
          ALL ITEMS ({totalItemsCount})
        </button>
        {ALL_BUDGET_CATEGORIES.map((catKey) => {
          const catInfo = summary.categoryBreakdown[catKey];
          if (catInfo.count === 0) return null;
          const isSelected = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`btn-bauhaus px-4 py-2 border-2 border-black text-xs font-mono uppercase tracking-widest shrink-0 transition-all ${
                isSelected
                  ? "bg-bauhausRed text-white font-black shadow-hard-4"
                  : "bg-white text-black font-bold shadow-hard-2 hover:bg-bauhausYellow"
              }`}
            >
              {CATEGORY_LABELS[catKey]} ({formatINR(catInfo.estimatedMinor)})
            </button>
          );
        })}
      </div>
    </div>
  );
}
