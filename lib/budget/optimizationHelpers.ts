/**
 * Heuristics and proportional reduction algorithms for trimming non-essential event budget items.
 */
import { BudgetItem, BudgetCategory, EventProfile, PlanningPriority } from "../types/event";
import { percentOfMoney, rupeesToPaise, paiseToRupees } from "./moneyUtils";

/**
 * Returns a new item array with protected and essential items flagged against automatic reductions.
 */
export function markProtectedItems(items: BudgetItem[], mustHaves: string[]): void {
  const protectedKeywords = mustHaves.map((m) => m.toLowerCase());
  for (const item of items) {
    const itemName = item.name.toLowerCase();
    const itemCat = item.category.toLowerCase();
    const matchesMustHave = protectedKeywords.some(
      (kw) => itemName.includes(kw) || itemCat.includes(kw)
    );
    if (matchesMustHave) {
      item.isProtected = true;
    }
  }
}

/**
 * Orders budget items by priority and flexibility for deterministic expenditure reduction.
 */
export function determineTrimOrder(profile: EventProfile): BudgetCategory[] {
  const trimOrder: BudgetCategory[] = [
    "entertainment",
    "photography",
    "decorations",
    "invitations",
    "transportation",
    "miscellaneous",
    "venue",
    "food_beverage",
    "contingency_reserve",
  ];

  const categoryToPriority: Partial<Record<BudgetCategory, PlanningPriority>> = {
    venue: "venue",
    food_beverage: "food",
    decorations: "decor",
    photography: "photography",
    entertainment: "entertainment",
  };

  const getPriorityRank = (category: BudgetCategory, priorities: readonly string[]): number => {
    const directIdx = priorities.indexOf(category);
    if (directIdx !== -1) return directIdx;
    const mapped = categoryToPriority[category];
    return mapped ? priorities.indexOf(mapped) : -1;
  };

  const userPriorities: readonly string[] = profile.priorities || [];
  // Sort in reverse priority order: unprioritized and lower-priority categories trim first
  trimOrder.sort((a, b) => {
    const aPriority = getPriorityRank(a, userPriorities);
    const bPriority = getPriorityRank(b, userPriorities);
    if (aPriority !== -1 && bPriority === -1) return 1;
    if (aPriority === -1 && bPriority !== -1) return -1;
    if (aPriority !== -1 && bPriority !== -1) return bPriority - aPriority;
    return 0;
  });

  return trimOrder;
}

interface CategoryCutConfig {
  percentage: number;
  reason: string;
}

const CATEGORY_CUT_CONFIGS: Partial<Record<BudgetCategory, CategoryCutConfig>> = {
  invitations: {
    percentage: 85,
    reason: "Switched to bespoke animated WhatsApp/digital invites instead of printed stationery.",
  },
  photography: {
    percentage: 50,
    reason: "Adjusted photography to 2.5-hour key moments package (cake cutting & portraits).",
  },
  entertainment: {
    percentage: 60,
    reason: "Selected curated anime playlist + portable PA speaker & DIY trivia games.",
  },
  venue: {
    percentage: 25,
    reason: "Negotiated 4-hour evening slot rate with local society club hall / outdoor lawn.",
  },
  contingency_reserve: {
    percentage: 75,
    reason: "Streamlined contingency buffer to meet revised budget limit.",
  },
};

function computeFoodReduction(
  currentCost: number,
  deficit: number,
  guestCount: number
): { reductionMinor: number; reason: string } {
  const minPerGuestMinor = rupeesToPaise(200);
  const minFoodTotalMinor = minPerGuestMinor * guestCount;
  const availableReduction = Math.max(0, currentCost - minFoodTotalMinor);
  if (availableReduction > 0) {
    const reductionMinor = Math.min(deficit, availableReduction);
    return {
      reductionMinor,
      reason: `Optimized vegetarian menu: 2 starters, live chaat counter, 1 main course & dessert (₹${Math.round(
        paiseToRupees(currentCost - reductionMinor) / guestCount
      )}/guest), strictly preserving 100% vegetarian quality.`,
    };
  }
  return { reductionMinor: 0, reason: "" };
}

/**
 * Calculates the minor-unit reduction to apply to a budget item without exceeding its maximum cut.
 */
export function computeItemReduction(
  item: BudgetItem,
  deficit: number,
  profile: EventProfile
): { reductionMinor: number; reason: string } {
  const currentCost = item.estimatedCostMinor;
  if (currentCost <= 0) return { reductionMinor: 0, reason: "" };

  if (item.category === "food_beverage") {
    return computeFoodReduction(currentCost, deficit, profile.guestCount);
  }

  if (item.category === "decorations") {
    const percentage = item.isProtected ? 35 : 50;
    return {
      reductionMinor: Math.min(deficit, percentOfMoney(currentCost, percentage)),
      reason: "Streamlined stage setup with DIY printed anime standees & fairy light backdrop.",
    };
  }

  const config = CATEGORY_CUT_CONFIGS[item.category] || {
    percentage: 35,
    reason: "Streamlined non-essential expenses.",
  };

  return {
    reductionMinor: Math.min(deficit, percentOfMoney(currentCost, config.percentage)),
    reason: config.reason,
  };
}
