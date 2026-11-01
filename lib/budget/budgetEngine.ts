/**
 * Deterministic budget computation and constraint-satisfaction optimization engine using integer minor units.
 */
import { BudgetItem, BudgetCategory, BudgetSummary, EventProfile } from "../types/event";
import { subtractMoney, formatINR, addMoney } from "./moneyUtils";
import { computeCategoryBreakdown, buildBudgetWarningsAndTips } from "./summaryHelpers";
import {
  markProtectedItems,
  determineTrimOrder,
  computeItemReduction,
} from "./optimizationHelpers";

/**
 * Ordered list of canonical budget categories used across financial calculations.
 */
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

/**
 * User-facing display names for each canonical budget category.
 */
export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue: "Venue & Permits",
  food_beverage: "Food, Drinks & Cake",
  decorations: "Decorations & Theme",
  photography: "Photography & Video",
  entertainment: "Music & Entertainment",
  invitations: "Invitations & Stationery",
  transportation: "Travel & Logistics",
  miscellaneous: "Sundry & Extras",
  contingency_reserve: "Contingency Fund",
};

/**
 * Calculates a comprehensive budget summary deterministically from budget items
 */
export function calculateBudgetSummary(
  totalBudgetMinor: number,
  items: BudgetItem[],
  guestCount = 1
): BudgetSummary {
  const { breakdown, totalEstimatedMinor, totalActualMinor, contingencyMinor } =
    computeCategoryBreakdown(items, totalBudgetMinor);

  const remainingEstimatedMinor = subtractMoney(totalBudgetMinor, totalEstimatedMinor);
  const remainingActualMinor = subtractMoney(totalBudgetMinor, totalActualMinor);
  const isOverspent = totalEstimatedMinor > totalBudgetMinor;
  const deficitMinor = isOverspent ? subtractMoney(totalEstimatedMinor, totalBudgetMinor) : 0;
  const contingencyPercent =
    totalBudgetMinor > 0 ? Math.round((contingencyMinor / totalBudgetMinor) * 100) : 0;

  const { warnings, savingsTips } = buildBudgetWarningsAndTips({
    breakdown,
    totalBudgetMinor,
    totalEstimatedMinor,
    guestCount,
    deficitMinor,
    contingencyPercent,
  });

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
    isFeasible: !isOverspent && totalEstimatedMinor > 0,
    categoryBreakdown: breakdown,
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

function applyReductions(
  items: BudgetItem[],
  initialDeficit: number,
  profile: EventProfile
): {
  modifications: BudgetOptimizationResult["modifications"];
  deficit: number;
} {
  let deficit = initialDeficit;
  const modifications: BudgetOptimizationResult["modifications"] = [];
  const trimOrder = determineTrimOrder(profile);

  for (const category of trimOrder) {
    if (deficit <= 0) break;

    const candidates = items.filter(
      (item) =>
        item.category === category &&
        (item.flexible || category === "food_beverage" || category === "venue")
    );

    for (const item of candidates) {
      if (deficit <= 0) break;
      const { reductionMinor, reason } = computeItemReduction(item, deficit, profile);
      if (reductionMinor > 0) {
        const currentCost = item.estimatedCostMinor;
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

  return { modifications, deficit };
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
  const optimizedItems: BudgetItem[] = currentItems.map((item) => ({ ...item }));
  markProtectedItems(optimizedItems, profile.mustHaves || []);

  const currentTotal = optimizedItems.reduce(
    (sum, item) => addMoney(sum, item.estimatedCostMinor),
    0
  );
  const initialDeficit =
    currentTotal > targetBudgetMinor ? subtractMoney(currentTotal, targetBudgetMinor) : 0;

  if (initialDeficit <= 0) {
    return {
      isFeasible: true,
      targetBudgetMinor,
      newEstimatedMinor: currentTotal,
      savingsAchievedMinor: 0,
      deficitRemainingMinor: 0,
      optimizedItems,
      modifications: [],
      unviolatedMustHaves: profile.mustHaves || [],
      explanation: `Current plan of ${formatINR(currentTotal)} already fits within the target budget of ${formatINR(targetBudgetMinor)}.`,
      conflicts: [],
    };
  }

  const { modifications } = applyReductions(optimizedItems, initialDeficit, profile);

  const newEstimatedMinor = optimizedItems.reduce(
    (sum, item) => addMoney(sum, item.estimatedCostMinor),
    0
  );
  const savingsAchievedMinor = subtractMoney(currentTotal, newEstimatedMinor);
  const deficitRemainingMinor =
    newEstimatedMinor > targetBudgetMinor ? subtractMoney(newEstimatedMinor, targetBudgetMinor) : 0;
  const isFeasible = deficitRemainingMinor === 0;

  const conflicts = isFeasible
    ? []
    : [
        `Cannot safely reduce budget to ${formatINR(targetBudgetMinor)} without violating non-negotiable requirements (${profile.mustHaves.join(", ")}) or dipping below baseline food quality of ₹200/guest for ${profile.guestCount} guests.`,
      ];

  const explanation = isFeasible
    ? `Successfully optimized budget to ${formatINR(newEstimatedMinor)}, saving ${formatINR(savingsAchievedMinor)}. All ${profile.mustHaves.length} non-negotiable constraints were preserved.`
    : `Deficit of ${formatINR(deficitRemainingMinor)} remains. Protected constraints prevented further automated cuts. Consider adjusting guest count or venue format.`;

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
