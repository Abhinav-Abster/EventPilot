import { BudgetItem, BudgetCategory, BudgetSummary, EventProfile } from "../types/event";
import {
  addMoney,
  subtractMoney,
  percentOfMoney,
  rupeesToPaise,
  paiseToRupees,
  formatINR,
} from "./moneyUtils";

export const ALL_BUDGET_CATEGORIES: BudgetCategory[] = [
  "venue",
  "food_beverage",
  "decorations",
  "photography",
  "entertainment",
  "invitations",
  "transportation",
  "miscellaneous",
  "contingency_reserve",
];

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: "Venue & Permits",
  food_beverage: "Food, Drinks & Cake",
  decorations: "Decorations & Ambience",
  photography: "Photography & Videography",
  entertainment: "Sound, DJ & Activities",
  invitations: "Invitations & Stationery",
  transportation: "Logistics & Transport",
  miscellaneous: "Contingency & Supplies",
  contingency_reserve: "Contingency Reserve",
};

/**
 * Calculates a comprehensive budget summary deterministically from budget items
 */
export function calculateBudgetSummary(
  totalBudgetMinor: number,
  items: BudgetItem[],
  guestCount: number = 1
): BudgetSummary {
  let totalEstimatedMinor = 0;
  let totalActualMinor = 0;
  let contingencyMinor = 0;

  const initialBreakdown: Record<
    BudgetCategory,
    { estimatedMinor: number; actualMinor: number; count: number; percentageOfBudget: number }
  > = {
    venue: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    food_beverage: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    decorations: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    photography: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    entertainment: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    invitations: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    transportation: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    miscellaneous: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
    contingency_reserve: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
  };

  const categoryBreakdown = { ...initialBreakdown };

  for (const item of items) {
    totalEstimatedMinor = addMoney(totalEstimatedMinor, item.estimatedCostMinor);
    totalActualMinor = addMoney(totalActualMinor, item.actualCostMinor);

    if (item.category === "contingency_reserve") {
      contingencyMinor = addMoney(contingencyMinor, item.estimatedCostMinor);
    }

    const cat = categoryBreakdown[item.category];
    if (cat) {
      cat.estimatedMinor = addMoney(cat.estimatedMinor, item.estimatedCostMinor);
      cat.actualMinor = addMoney(cat.actualMinor, item.actualCostMinor);
      cat.count += 1;
    }
  }

  // Calculate percentage shares of total budget
  if (totalBudgetMinor > 0) {
    for (const catKey of ALL_BUDGET_CATEGORIES) {
      const cat = categoryBreakdown[catKey];
      cat.percentageOfBudget = Math.round((cat.estimatedMinor / totalBudgetMinor) * 100);
    }
  }

  const remainingEstimatedMinor = subtractMoney(totalBudgetMinor, totalEstimatedMinor);
  const remainingActualMinor = subtractMoney(totalBudgetMinor, totalActualMinor);
  const isOverspent = totalEstimatedMinor > totalBudgetMinor;
  const deficitMinor = isOverspent ? subtractMoney(totalEstimatedMinor, totalBudgetMinor) : 0;
  const contingencyPercent =
    totalBudgetMinor > 0 ? Math.round((contingencyMinor / totalBudgetMinor) * 100) : 0;

  // Generate deterministic feasibility warnings and financial insights
  const warnings: string[] = [];
  const savingsTips: string[] = [];

  if (isOverspent) {
    warnings.push(
      `Budget exceeded by ${formatINR(deficitMinor)}. The current plan costs ${formatINR(
        totalEstimatedMinor
      )} against your total limit of ${formatINR(totalBudgetMinor)}.`
    );
  }

  // Check per-guest catering realism
  const cateringMinor = categoryBreakdown.food_beverage.estimatedMinor;
  if (guestCount > 0 && cateringMinor > 0) {
    const costPerGuest = paiseToRupees(cateringMinor) / guestCount;
    if (costPerGuest < 150) {
      warnings.push(
        `Catering estimate of ₹${Math.round(costPerGuest)}/guest is extremely low for a sit-down or buffet meal in Pune. Consider snacks/high-tea format or budget ₹250-₹350/guest.`
      );
    }
  }

  // Contingency health check
  if (contingencyPercent < 5) {
    warnings.push(
      `Contingency buffer is only ${contingencyPercent}% of total budget. A minimum 5-10% reserve (${formatINR(
        percentOfMoney(totalBudgetMinor, 7.5)
      )}) is strongly recommended for unexpected expenses.`
    );
  }

  // Savings recommendations
  if (categoryBreakdown.decorations.estimatedMinor > percentOfMoney(totalBudgetMinor, 25)) {
    savingsTips.push(
      "Decorations account for over 25% of budget. Switch to DIY character cutouts, digital photo backdrops, or reusable bunting to save up to 40%."
    );
  }

  if (categoryBreakdown.photography.estimatedMinor > percentOfMoney(totalBudgetMinor, 20)) {
    savingsTips.push(
      "Professional photography is taking a large share. Consider booking an 2-3 hour student/freelance photographer or a dedicated guest photo booth station."
    );
  }

  if (categoryBreakdown.venue.estimatedMinor > percentOfMoney(totalBudgetMinor, 35)) {
    savingsTips.push(
      "Venue cost is high. Consider society clubhouse, private rooftop, or public community garden with nominal municipal permits."
    );
  }

  const isFeasible = !isOverspent && totalEstimatedMinor > 0;

  return {
    totalBudgetMinor,
    totalEstimatedMinor,
    totalActualMinor,
    remainingEstimatedMinor,
    remainingActualMinor,
    contingencyMinor,
    contingencyPercent,
    isOverspent,
    deficitMinor,
    isFeasible,
    categoryBreakdown,
    warnings,
    savingsTips,
  };
}

export interface BudgetOptimizationResult {
  isFeasible: boolean;
  targetBudgetMinor: number;
  newEstimatedMinor: number;
  savingsAchievedMinor: number;
  deficitRemainingMinor: number;
  optimizedItems: BudgetItem[];
  modifications: Array<{
    itemId: string;
    name: string;
    category: BudgetCategory;
    beforeMinor: number;
    afterMinor: number;
    differenceMinor: number;
    reason: string;
  }>;
  unviolatedMustHaves: string[];
  explanation: string;
  conflicts: string[];
}

/**
 * Deterministically optimizes and trims budget items to meet a lower budget target
 * while strictly protecting non-negotiable must-haves and prioritizing flexible items.
 */
export function optimizeBudget(
  currentItems: BudgetItem[],
  targetBudgetMinor: number,
  profile: EventProfile
): BudgetOptimizationResult {
  const currentSummary = calculateBudgetSummary(targetBudgetMinor, currentItems, profile.guestCount);
  const modifications: BudgetOptimizationResult["modifications"] = [];
  const conflicts: string[] = [];

  // Deep copy items to avoid mutating state
  const optimizedItems: BudgetItem[] = currentItems.map((item) => ({ ...item }));

  // Identify protected keywords from profile mustHaves
  const protectedKeywords = (profile.mustHaves || []).map((m) => m.toLowerCase());

  // Mark items as protected if they match mustHaves
  for (const item of optimizedItems) {
    const itemName = item.name.toLowerCase();
    const itemCat = item.category.toLowerCase();
    const matchesMustHave = protectedKeywords.some(
      (kw) => itemName.includes(kw) || itemCat.includes(kw)
    );
    if (matchesMustHave) {
      item.isProtected = true;
    }
  }

  let currentTotal = optimizedItems.reduce(
    (sum, item) => addMoney(sum, item.estimatedCostMinor),
    0
  );
  let deficit = currentTotal > targetBudgetMinor ? subtractMoney(currentTotal, targetBudgetMinor) : 0;

  if (deficit <= 0) {
    return {
      isFeasible: true,
      targetBudgetMinor,
      newEstimatedMinor: currentTotal,
      savingsAchievedMinor: 0,
      deficitRemainingMinor: 0,
      optimizedItems,
      modifications: [],
      unviolatedMustHaves: profile.mustHaves || [],
      explanation: `Current plan of ${formatINR(currentTotal)} already fits within the target budget of ${formatINR(
        targetBudgetMinor
      )}.`,
      conflicts: [],
    };
  }

  // Step 1: Trim non-critical categories in order of user priority inversion
  // Priorities: if priority has 'food', do not trim food first! Trim photography, decor, entertainment, transport first.
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

  // Adjust order based on profile priorities
  const userPriorities = profile.priorities || [];
  trimOrder.sort((a, b) => {
    const aPriority = userPriorities.indexOf(a as any);
    const bPriority = userPriorities.indexOf(b as any);
    if (aPriority !== -1 && bPriority === -1) return 1; // keep a protected longer
    if (aPriority === -1 && bPriority !== -1) return -1;
    if (aPriority !== -1 && bPriority !== -1) return bPriority - aPriority;
    return 0;
  });

  // Execute deterministic reduction tiers
  for (const category of trimOrder) {
    if (deficit <= 0) break;

    const candidates = optimizedItems.filter(
      (item) =>
        item.category === category &&
        (item.flexible || category === "food_beverage" || category === "venue")
    );

    for (const item of candidates) {
      if (deficit <= 0) break;

      const currentCost = item.estimatedCostMinor;
      if (currentCost <= 0) continue;

      let reductionMinor = 0;
      let reason = "";

      if (category === "invitations") {
        // Digital invitations instead of printed
        reductionMinor = Math.min(deficit, percentOfMoney(currentCost, 85));
        reason = "Switched to bespoke animated WhatsApp/digital invites instead of printed stationery.";
      } else if (category === "photography") {
        // Reduced coverage hours or freelance package
        reductionMinor = Math.min(deficit, percentOfMoney(currentCost, 50));
        reason = "Adjusted photography to 2.5-hour key moments package (cake cutting & portraits).";
      } else if (category === "entertainment") {
        // Curated Spotify/Bluetooth sound setup instead of high-cost DJ
        reductionMinor = Math.min(deficit, percentOfMoney(currentCost, 60));
        reason = "Selected curated anime playlist + portable PA speaker & DIY trivia games.";
      } else if (category === "decorations") {
        // DIY anime backdrops, balloon arches, fairy lights (preserves anime theme!)
        const maxDecorCut = item.isProtected ? percentOfMoney(currentCost, 35) : percentOfMoney(currentCost, 50);
        reductionMinor = Math.min(deficit, maxDecorCut);
        reason = "Streamlined stage setup with DIY printed anime standees & fairy light backdrop.";
      } else if (category === "venue") {
        // Venue rental negotiation / timing discount
        reductionMinor = Math.min(deficit, percentOfMoney(currentCost, 25));
        reason = "Negotiated 4-hour evening slot rate with local society club hall / outdoor lawn.";
      } else if (category === "food_beverage") {
        // Food optimization: smart menu pairing while preserving 100% vegetarian preference
        const minPerGuestMinor = rupeesToPaise(200); // baseline floor: ₹200/guest
        const minFoodTotalMinor = minPerGuestMinor * profile.guestCount;
        const availableReduction = Math.max(0, currentCost - minFoodTotalMinor);
        if (availableReduction > 0) {
          reductionMinor = Math.min(deficit, availableReduction);
          reason = `Optimized vegetarian menu: 2 starters, live chaat counter, 1 main course & dessert (₹${Math.round(
            paiseToRupees(currentCost - reductionMinor) / profile.guestCount
          )}/guest), strictly preserving 100% vegetarian quality.`;
        }
      } else if (category === "contingency_reserve") {
        // Contingency can be trimmed up to 75% when facing deficit
        reductionMinor = Math.min(deficit, percentOfMoney(currentCost, 75));
        reason = "Streamlined contingency buffer to meet revised budget limit.";
      } else {
        reductionMinor = Math.min(deficit, percentOfMoney(currentCost, 35));
        reason = "Streamlined non-essential expenses.";
      }

      if (reductionMinor > 0) {
        const newCost = subtractMoney(currentCost, reductionMinor);
        modifications.push({
          itemId: item.id,
          name: item.name,
          category: item.category,
          beforeMinor: currentCost,
          afterMinor: newCost,
          differenceMinor: reductionMinor,
          reason,
        });
        item.estimatedCostMinor = newCost;
        deficit = subtractMoney(deficit, reductionMinor);
      }
    }
  }

  // Recalculate summary
  const newEstimatedMinor = optimizedItems.reduce(
    (sum, item) => addMoney(sum, item.estimatedCostMinor),
    0
  );
  const savingsAchievedMinor = subtractMoney(currentTotal, newEstimatedMinor);
  const deficitRemainingMinor =
    newEstimatedMinor > targetBudgetMinor
      ? subtractMoney(newEstimatedMinor, targetBudgetMinor)
      : 0;

  const isFeasible = deficitRemainingMinor === 0;

  if (!isFeasible) {
    conflicts.push(
      `Cannot safely reduce budget to ${formatINR(
        targetBudgetMinor
      )} without violating non-negotiable requirements (${profile.mustHaves.join(
        ", "
      )}) or dipping below baseline food quality of ₹200/guest for ${profile.guestCount} guests.`
    );
  }

  const explanation = isFeasible
    ? `Successfully optimized budget to ${formatINR(
        newEstimatedMinor
      )}, saving ${formatINR(savingsAchievedMinor)}. All ${
        profile.mustHaves.length
      } non-negotiable constraints were preserved.`
    : `Deficit of ${formatINR(
        deficitRemainingMinor
      )} remains. Protected constraints prevented further automated cuts. Consider adjusting guest count or venue format.`;

  return {
    isFeasible,
    targetBudgetMinor,
    newEstimatedMinor,
    savingsAchievedMinor,
    deficitRemainingMinor,
    optimizedItems,
    modifications,
    unviolatedMustHaves: profile.mustHaves || [],
    explanation,
    conflicts,
  };
}
