import { BudgetItem, BudgetCategory, EventProfile, PlanningPriority } from "../types/event";
import { percentOfMoney, rupeesToPaise, paiseToRupees } from "./moneyUtils";

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

export function computeItemReduction(
  item: BudgetItem,
  deficit: number,
  profile: EventProfile
): { reductionMinor: number; reason: string } {
  const currentCost = item.estimatedCostMinor;
  if (currentCost <= 0) return { reductionMinor: 0, reason: "" };

  const { category } = item;
  if (category === "invitations") {
    return {
      reductionMinor: Math.min(deficit, percentOfMoney(currentCost, 85)),
      reason: "Switched to bespoke animated WhatsApp/digital invites instead of printed stationery.",
    };
  }
  if (category === "photography") {
    return {
      reductionMinor: Math.min(deficit, percentOfMoney(currentCost, 50)),
      reason: "Adjusted photography to 2.5-hour key moments package (cake cutting & portraits).",
    };
  }
  if (category === "entertainment") {
    return {
      reductionMinor: Math.min(deficit, percentOfMoney(currentCost, 60)),
      reason: "Selected curated anime playlist + portable PA speaker & DIY trivia games.",
    };
  }
  if (category === "decorations") {
    const maxDecorCut = item.isProtected
      ? percentOfMoney(currentCost, 35)
      : percentOfMoney(currentCost, 50);
    return {
      reductionMinor: Math.min(deficit, maxDecorCut),
      reason: "Streamlined stage setup with DIY printed anime standees & fairy light backdrop.",
    };
  }
  if (category === "venue") {
    return {
      reductionMinor: Math.min(deficit, percentOfMoney(currentCost, 25)),
      reason: "Negotiated 4-hour evening slot rate with local society club hall / outdoor lawn.",
    };
  }
  if (category === "food_beverage") {
    const minPerGuestMinor = rupeesToPaise(200);
    const minFoodTotalMinor = minPerGuestMinor * profile.guestCount;
    const availableReduction = Math.max(0, currentCost - minFoodTotalMinor);
    if (availableReduction > 0) {
      const reductionMinor = Math.min(deficit, availableReduction);
      return {
        reductionMinor,
        reason: `Optimized vegetarian menu: 2 starters, live chaat counter, 1 main course & dessert (₹${Math.round(
          paiseToRupees(currentCost - reductionMinor) / profile.guestCount
        )}/guest), strictly preserving 100% vegetarian quality.`,
      };
    }
    return { reductionMinor: 0, reason: "" };
  }
  if (category === "contingency_reserve") {
    return {
      reductionMinor: Math.min(deficit, percentOfMoney(currentCost, 75)),
      reason: "Streamlined contingency buffer to meet revised budget limit.",
    };
  }

  return {
    reductionMinor: Math.min(deficit, percentOfMoney(currentCost, 35)),
    reason: "Streamlined non-essential expenses.",
  };
}
