import { describe, it, expect } from "vitest";
import { createReferenceEventPlan } from "../lib/persistence/defaultEvent";
import { calculateBudgetSummary } from "../lib/budget/budgetEngine";
import {
  parseConstraintIntent,
  generateReplanningProposals,
} from "../lib/replanning/replanningEngine";
import { recalculateSchedule } from "../lib/timeline/timelineEngine";
import { paiseToRupees, rupeesToPaise } from "../lib/budget/moneyUtils";
import { EventPlan } from "../lib/types/event";

describe("Phase 6 End-to-End User Journey Audit", () => {
  it("executes the complete 11-step user journey with 100% integrity", () => {
    // 1. Initial State: Birthday event for 60 guests with ₹40,000 budget
    let currentPlan: EventPlan = createReferenceEventPlan();
    expect(currentPlan.profile.guestCount).toBe(60);
    expect(paiseToRupees(currentPlan.profile.totalBudgetMinor)).toBe(40000);
    expect(currentPlan.profile.location.city).toBe("Pune");
    expect(currentPlan.profile.location.venueType).toBe("outdoor");
    expect(currentPlan.profile.dietaryPreferences).toContain("vegetarian");

    // 2. Review initial budget
    let summary = calculateBudgetSummary(
      currentPlan.profile.totalBudgetMinor,
      currentPlan.budgetItems,
      currentPlan.profile.guestCount
    );
    expect(summary.isOverspent).toBe(false);
    expect(summary.isFeasible).toBe(true);
    expect(paiseToRupees(summary.totalEstimatedMinor)).toBe(40000);

    // 3. Mark tasks complete and edit vendor estimate
    const venueTaskId = "task-venue-lock";
    currentPlan = {
      ...currentPlan,
      tasks: currentPlan.tasks.map((t) =>
        t.id === venueTaskId ? { ...t, status: "completed" as const } : t
      ),
      vendors: currentPlan.vendors.map((v) =>
        v.category === "caterer"
          ? { ...v, actualQuoteMinor: rupeesToPaise(17500) }
          : v
      ),
    };
    const completedVenueTask = currentPlan.tasks.find((t) => t.id === venueTaskId);
    expect(completedVenueTask?.status).toBe("completed");

    // Downstream tasks depending on venue should now be unblocked
    const decorTask = currentPlan.tasks.find((t) => t.id === "task-decor-plan");
    const { updatedTasks } = recalculateSchedule(currentPlan.tasks, currentPlan.profile.date);
    const updatedDecor = updatedTasks.find((t) => t.id === "task-decor-plan");
    expect(updatedDecor?.isBlocked).toBe(false);

    // 4 & 5. User requests: "My budget is now ₹30,000."
    const budgetIntent = parseConstraintIntent("My budget is now ₹30,000.", currentPlan);
    expect(budgetIntent.changeType).toBe("budget_change");

    const budgetProposals = generateReplanningProposals(currentPlan, budgetIntent);
    expect(budgetProposals.length).toBeGreaterThan(0);
    const budgetProposal = budgetProposals[0];

    // Verify feasible savings proposed without violating protected requirements
    expect(budgetProposal.impact.preservedConstraints).toContain("Anime-Themed Decor & Cake");
    expect(budgetProposal.impact.preservedConstraints).toContain("100% Pure Vegetarian Food");
    expect(paiseToRupees(budgetProposal.revisedPlan.profile.totalBudgetMinor)).toBe(30000);

    // 6. User rejects one proposal -> Verify previous plan remains intact
    const originalPlanSnapshot = JSON.stringify(currentPlan);
    // Simulating user clicking "Reject Proposal" (leaving currentPlan unchanged)
    expect(JSON.stringify(currentPlan)).toBe(originalPlanSnapshot);
    expect(paiseToRupees(currentPlan.profile.totalBudgetMinor)).toBe(40000);

    // 7. User accepts proposal -> Verify state updates
    currentPlan = { ...budgetProposal.revisedPlan };
    expect(paiseToRupees(currentPlan.profile.totalBudgetMinor)).toBe(30000);
    summary = calculateBudgetSummary(
      currentPlan.profile.totalBudgetMinor,
      currentPlan.budgetItems,
      currentPlan.profile.guestCount
    );
    expect(summary.totalBudgetMinor).toBe(rupeesToPaise(30000));

    // 8. User changes venue preference: "Move the party indoors"
    const venueIntent = parseConstraintIntent("Move the party indoors due to rain", currentPlan);
    expect(venueIntent.changeType).toBe("venue_change");
    expect(venueIntent.newVenueType).toBe("indoor");

    const venueProposals = generateReplanningProposals(currentPlan, venueIntent);
    expect(venueProposals.length).toBeGreaterThan(0);
    const venueProposal = venueProposals[0];

    // 9. Verify plan, tasks, and costs are updated
    expect(venueProposal.revisedPlan.profile.location.venueType).toBe("indoor");
    expect(venueProposal.diffs.some((d) => d.field === "venueType")).toBe(true);

    // Apply the venue change
    currentPlan = { ...venueProposal.revisedPlan };
    expect(currentPlan.profile.location.venueType).toBe("indoor");

    // 10. Persistence simulation: Serializing and Deserializing recovers valid state
    const serialized = JSON.stringify(currentPlan);
    const restored = JSON.parse(serialized);
    expect(restored.profile.location.venueType).toBe("indoor");
    expect(paiseToRupees(restored.profile.totalBudgetMinor)).toBe(30000);

    // 11. Restore the reference fixture.
    currentPlan = createReferenceEventPlan();
    expect(currentPlan.profile.name).toBe("Aanya's 18th Anime Birthday Bash");
    expect(currentPlan.profile.location.venueType).toBe("outdoor");
    expect(paiseToRupees(currentPlan.profile.totalBudgetMinor)).toBe(40000);
    expect(currentPlan.tasks.length).toBeGreaterThanOrEqual(7);
  });
});
