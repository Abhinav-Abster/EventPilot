import { describe, it, expect } from "vitest";
import { buildCompactReplanningSummary } from "../lib/ai/replanningSummary";
import { createReferenceEventPlan } from "../lib/persistence/defaultEvent";

describe("buildCompactReplanningSummary", () => {
  const plan = createReferenceEventPlan();

  it("extracts core plan metadata into compact summary", () => {
    const summary = buildCompactReplanningSummary(plan, "");
    expect(summary.name).toBe(plan.profile.name);
    expect(summary.type).toBe(plan.profile.type);
    expect(summary.date).toBe(plan.profile.date);
    expect(summary.guestCount).toBe(plan.profile.guestCount);
    expect(summary.totalBudgetMinor).toBe(plan.profile.totalBudgetMinor);
    expect(summary.taskCount).toBe(plan.tasks.length);
    expect(summary.vendorCount).toBe(plan.vendors.length);
    expect(summary.budgetItemCount).toBe(plan.budgetItems.length);
    expect(summary.mustHaves).toEqual(plan.profile.mustHaves);
  });

  it("identifies protected budget items", () => {
    const summary = buildCompactReplanningSummary(plan);
    const expectedProtected = plan.budgetItems.filter((b) => b.isProtected).map((b) => b.name);
    expect(summary.protectedBudgetItems).toEqual(expectedProtected);
  });

  it("filters relevant budget items, tasks, and vendors based on user query keywords", () => {
    const cateringSummary = buildCompactReplanningSummary(plan, "caterer food menu");
    expect(cateringSummary.relevantBudgetItems.length).toBeGreaterThan(0);
    expect(
      cateringSummary.relevantBudgetItems.some(
        (b) => b.toLowerCase().includes("food") || b.toLowerCase().includes("cater")
      )
    ).toBe(true);

    const decorSummary = buildCompactReplanningSummary(plan, "decor stage balloons");
    expect(decorSummary.relevantBudgetItems.some((b) => b.toLowerCase().includes("decor"))).toBe(
      true
    );
  });
});
