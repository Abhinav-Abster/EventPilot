import { EventPlan } from "../types/event";

export interface CompactReplanningSummary {
  name: string;
  type: string;
  date: string;
  guestCount: number;
  totalBudgetMinor: number;
  taskCount: number;
  vendorCount: number;
  budgetItemCount: number;
  mustHaves: string[];
  protectedBudgetItems: string[];
  relevantBudgetItems: string[];
  relevantTasks: string[];
  relevantVendors: string[];
}

/**
 * Builds a token-efficient summary of the current plan to send to Gemini
 * for generating explanations during adaptive replanning.
 */
export function buildCompactReplanningSummary(
  currentPlan: EventPlan,
  userQuery: string = ""
): CompactReplanningSummary {
  const queryWords = userQuery
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  const isRelevant = (text: string) => {
    if (queryWords.length === 0) return true;
    const lower = text.toLowerCase();
    return queryWords.some((w) => lower.includes(w));
  };

  const relevantBudgetItems = currentPlan.budgetItems
    .filter((b) => isRelevant(b.name) || isRelevant(b.category))
    .map((b) => `${b.name} (${b.category}: ${b.estimatedCostMinor})`)
    .slice(0, 10);

  const relevantTasks = currentPlan.tasks
    .filter((t) => isRelevant(t.title) || isRelevant(t.category))
    .map((t) => `${t.title} (${t.status})`)
    .slice(0, 10);

  const relevantVendors = currentPlan.vendors
    .filter((v) => isRelevant(v.name) || isRelevant(v.category))
    .map((v) => `${v.name} (${v.category}: ${v.bookingStatus})`)
    .slice(0, 10);

  const protectedBudgetItems = currentPlan.budgetItems
    .filter((b) => b.isProtected)
    .map((b) => b.name);

  return {
    name: currentPlan.profile.name,
    type: currentPlan.profile.type,
    date: currentPlan.profile.date,
    guestCount: currentPlan.profile.guestCount,
    totalBudgetMinor: currentPlan.profile.totalBudgetMinor,
    taskCount: currentPlan.tasks.length,
    vendorCount: currentPlan.vendors.length,
    budgetItemCount: currentPlan.budgetItems.length,
    mustHaves: currentPlan.profile.mustHaves || [],
    protectedBudgetItems,
    relevantBudgetItems,
    relevantTasks,
    relevantVendors,
  };
}
