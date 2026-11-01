import { BudgetItem, BudgetCategory, BUDGET_CATEGORIES } from "../../types/event";
import { isOneOf } from "../../utils/guards";
import { asRecord, text, integer } from "../parsingHelpers";
import { VALID_BUDGET_CATEGORIES_SET, BUDGET_CATEGORY_MAP } from "../categoryMaps";

function resolveBudgetCategory(raw: unknown): BudgetCategory {
  const normalized = text(raw, "miscellaneous")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
  const candidate = VALID_BUDGET_CATEGORIES_SET.has(normalized)
    ? normalized
    : (BUDGET_CATEGORY_MAP[normalized] ?? "miscellaneous");
  return isOneOf(BUDGET_CATEGORIES, candidate) ? candidate : "miscellaneous";
}

function balanceBudgetExcess(items: BudgetItem[], totalBudgetMinor: number): void {
  const totalEstimated = items.reduce((acc, item) => acc + item.estimatedCostMinor, 0);
  if (totalEstimated <= totalBudgetMinor || totalEstimated <= 0) return;

  const excess = totalEstimated - totalBudgetMinor;
  const flexibleItems = items.filter((i) => i.flexible && i.estimatedCostMinor > 0);
  if (flexibleItems.length > 0) {
    const flexibleTotal = flexibleItems.reduce((acc, i) => acc + i.estimatedCostMinor, 0);
    for (const item of flexibleItems) {
      const reduction = Math.round((item.estimatedCostMinor / flexibleTotal) * excess);
      item.estimatedCostMinor = Math.max(0, item.estimatedCostMinor - reduction);
    }
  } else {
    const ratio = totalBudgetMinor / totalEstimated;
    for (const item of items) {
      item.estimatedCostMinor = Math.max(0, Math.round(item.estimatedCostMinor * ratio));
    }
  }
}

export function normalizeBudgetItems(rawList: unknown[], totalBudgetMinor: number): BudgetItem[] {
  const fallbackList = [
    {
      name: "Venue Booking",
      category: "venue",
      estimatedCostMinor: Math.round(totalBudgetMinor * 0.25),
    },
    {
      name: "Food & Catering",
      category: "food_beverage",
      estimatedCostMinor: Math.round(totalBudgetMinor * 0.45),
    },
    {
      name: "Decorations & Theme",
      category: "decorations",
      estimatedCostMinor: Math.round(totalBudgetMinor * 0.15),
    },
    {
      name: "Contingency Buffer",
      category: "contingency_reserve",
      estimatedCostMinor: Math.round(totalBudgetMinor * 0.15),
    },
  ];

  const source = rawList.length > 0 ? rawList : fallbackList;
  const items: BudgetItem[] = source.map((value, index) => {
    const item = asRecord(value) ?? {};
    return {
      id: text(item.id, `ai-budget-${index + 1}`),
      category: resolveBudgetCategory(item.category),
      name: text(item.name, `Planned expense ${index + 1}`),
      estimatedCostMinor: integer(item.estimatedCostMinor ?? item.costMinor ?? item.cost, 10000),
      actualCostMinor: integer(item.actualCostMinor, 0),
      flexible: typeof item.flexible === "boolean" ? item.flexible : true,
      isProtected: typeof item.isProtected === "boolean" ? item.isProtected : false,
      notes: text(item.notes, "Generated from the event requirements."),
    };
  });

  balanceBudgetExcess(items, totalBudgetMinor);
  return items;
}
