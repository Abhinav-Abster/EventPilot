/**
 * Aggregation utilities computing category breakdowns, variance metrics, and heuristic budget health tips.
 */
import { BudgetItem, BudgetCategory, BUDGET_CATEGORIES } from "../types/event";
import { addMoney, percentOfMoney, formatINR, paiseToRupees } from "./moneyUtils";

export type CategoryBreakdownMap = Record<
  BudgetCategory,
  { estimatedMinor: number; actualMinor: number; count: number; percentageOfBudget: number }
>;

/**
 * Initializes an empty category breakdown map with zero allocation and spending.
 */
export function createEmptyCategoryBreakdown(): CategoryBreakdownMap {
  return {
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
}

/**
 * Aggregates budget items into categorical allocations and calculates percentage distributions.
 */
export function computeCategoryBreakdown(
  items: BudgetItem[],
  totalBudgetMinor: number
): {
  breakdown: CategoryBreakdownMap;
  totalEstimatedMinor: number;
  totalActualMinor: number;
  contingencyMinor: number;
} {
  let totalEstimatedMinor = 0;
  let totalActualMinor = 0;
  let contingencyMinor = 0;
  const breakdown = createEmptyCategoryBreakdown();

  for (const item of items) {
    totalEstimatedMinor = addMoney(totalEstimatedMinor, item.estimatedCostMinor);
    totalActualMinor = addMoney(totalActualMinor, item.actualCostMinor);

    if (item.category === "contingency_reserve") {
      contingencyMinor = addMoney(contingencyMinor, item.estimatedCostMinor);
    }

    const cat = breakdown[item.category];
    if (cat) {
      cat.estimatedMinor = addMoney(cat.estimatedMinor, item.estimatedCostMinor);
      cat.actualMinor = addMoney(cat.actualMinor, item.actualCostMinor);
      cat.count += 1;
    }
  }

  if (totalBudgetMinor > 0) {
    for (const catKey of BUDGET_CATEGORIES) {
      const cat = breakdown[catKey];
      cat.percentageOfBudget = Math.round((cat.estimatedMinor / totalBudgetMinor) * 100);
    }
  }

  return { breakdown, totalEstimatedMinor, totalActualMinor, contingencyMinor };
}

/**
 * Configuration options for generating budget warnings and actionable savings advice.
 */
export interface BudgetWarningsAndTipsOptions {
  breakdown: CategoryBreakdownMap;
  totalBudgetMinor: number;
  totalEstimatedMinor: number;
  guestCount: number;
  deficitMinor: number;
  contingencyPercent: number;
}

/**
 * Analyzes total spending against budget caps and generates actionable financial guidance.
 */
export function buildBudgetWarningsAndTips(
  optionsOrBreakdown: BudgetWarningsAndTipsOptions | CategoryBreakdownMap,
  totalBudgetMinor?: number,
  totalEstimatedMinor?: number,
  guestCount?: number,
  deficitMinor?: number,
  contingencyPercent?: number
): { warnings: string[]; savingsTips: string[] } {
  const opts: BudgetWarningsAndTipsOptions =
    "breakdown" in optionsOrBreakdown
      ? optionsOrBreakdown
      : {
          breakdown: optionsOrBreakdown,
          totalBudgetMinor: totalBudgetMinor ?? 0,
          totalEstimatedMinor: totalEstimatedMinor ?? 0,
          guestCount: guestCount ?? 0,
          deficitMinor: deficitMinor ?? 0,
          contingencyPercent: contingencyPercent ?? 0,
        };

  const {
    breakdown,
    totalBudgetMinor: budgetMinor,
    totalEstimatedMinor: estimatedMinor,
    guestCount: count,
    deficitMinor: deficit,
    contingencyPercent: contingencyPct,
  } = opts;

  const warnings: string[] = [];
  const savingsTips: string[] = [];

  if (estimatedMinor > budgetMinor) {
    warnings.push(
      `Budget exceeded by ${formatINR(deficit)}. The current plan costs ${formatINR(
        estimatedMinor
      )} against your total limit of ${formatINR(budgetMinor)}.`
    );
  }

  const cateringMinor = breakdown.food_beverage.estimatedMinor;
  if (count > 0 && cateringMinor > 0) {
    const costPerGuest = paiseToRupees(cateringMinor) / count;
    if (costPerGuest < 150) {
      warnings.push(
        `Catering estimate of ₹${Math.round(costPerGuest)}/guest is extremely low for a sit-down or buffet meal in Pune. Consider snacks/high-tea format or budget ₹250-₹350/guest.`
      );
    }
  }

  if (contingencyPct < 5) {
    warnings.push(
      `Contingency buffer is only ${contingencyPct}% of total budget. A minimum 5-10% reserve (${formatINR(
        percentOfMoney(budgetMinor, 7.5)
      )}) is strongly recommended for unexpected expenses.`
    );
  }

  if (breakdown.decorations.estimatedMinor > percentOfMoney(budgetMinor, 25)) {
    savingsTips.push(
      "Decorations account for over 25% of budget. Switch to DIY character cutouts, digital photo backdrops, or reusable bunting to save up to 40%."
    );
  }

  if (breakdown.photography.estimatedMinor > percentOfMoney(budgetMinor, 20)) {
    savingsTips.push(
      "Professional photography is taking a large share. Consider booking an 2-3 hour student/freelance photographer or a dedicated guest photo booth station."
    );
  }

  if (breakdown.venue.estimatedMinor > percentOfMoney(budgetMinor, 35)) {
    savingsTips.push(
      "Venue cost is high. Consider society clubhouse, private rooftop, or public community garden with nominal municipal permits."
    );
  }

  return { warnings, savingsTips };
}
