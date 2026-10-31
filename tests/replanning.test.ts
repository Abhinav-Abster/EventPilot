import { describe, it, expect } from "vitest";
import {
  parseConstraintIntent,
  generateReplanningProposals,
} from "../lib/replanning/replanningEngine";
import { createReferenceEventPlan } from "../lib/persistence/defaultEvent";
import { paiseToRupees } from "../lib/budget/moneyUtils";

describe("Adaptive Replanning Engine", () => {
  const initialPlan = createReferenceEventPlan();

  it("parses natural language budget reduction intent accurately", () => {
    const query = "My budget is now ₹30,000.";
    const intent = parseConstraintIntent(query, initialPlan);

    expect(intent.changeType).toBe("budget_change");
    expect(paiseToRupees(intent.targetBudgetMinor!)).toBe(30000);
  });

  it("parses additional guest count intent accurately", () => {
    const query = "We have 20 additional guests.";
    const intent = parseConstraintIntent(query, initialPlan);

    expect(intent.changeType).toBe("guest_count_change");
    // Initial was 60, +20 = 80
    expect(intent.newGuestCount).toBe(80);
  });

  it("parses venue relocation to indoor intent", () => {
    const query = "Move the party indoors due to rain forecast.";
    const intent = parseConstraintIntent(query, initialPlan);

    expect(intent.changeType).toBe("venue_change");
    expect(intent.newVenueType).toBe("indoor");
  });

  it("parses vendor cancellation intent", () => {
    const query = "The caterer cancelled at the last minute.";
    const intent = parseConstraintIntent(query, initialPlan);

    expect(intent.changeType).toBe("vendor_cancellation");
    expect(intent.cancelledVendorCategory).toBe("caterer");
  });

  it("generates ranked proposals with diffs and preserves protected must-haves", () => {
    const intent = parseConstraintIntent("My budget is now ₹30,000.", initialPlan);
    const proposals = generateReplanningProposals(initialPlan, intent);

    expect(proposals.length).toBeGreaterThan(0);
    const proposal = proposals[0];

    // Check impact
    expect(proposal.impact.preservedConstraints).toContain("Anime-Themed Decor & Cake");
    expect(proposal.impact.preservedConstraints).toContain("100% Pure Vegetarian Food");
    expect(proposal.diffs.length).toBeGreaterThan(0);

    // Verify target revised plan respects ₹30,000 budget
    expect(paiseToRupees(proposal.revisedPlan.profile.totalBudgetMinor)).toBe(30000);

    // Check diff format
    const budgetDiff = proposal.diffs.find((d) => d.field === "totalBudgetMinor");
    expect(budgetDiff).toBeDefined();
    expect(budgetDiff?.before).toContain("40,000");
    expect(budgetDiff?.after).toContain("30,000");
  });

  it("propagates venue change to facility tasks and budget items without losing catering preference", () => {
    const intent = parseConstraintIntent("Move the party indoors", initialPlan);
    const proposals = generateReplanningProposals(initialPlan, intent);
    const proposal = proposals[0];

    expect(proposal.revisedPlan.profile.location.venueType).toBe("indoor");
    // Vegetarian food must remain intact!
    expect(proposal.revisedPlan.profile.dietaryPreferences).toContain("vegetarian");

    // Weather task should have adapted to indoor checks
    const weatherTask = proposal.revisedPlan.tasks.find((t) => t.id === "task-weather-check");
    expect(weatherTask?.title).toContain("Air Conditioning");
  });

  it("vendor cancellation freezes liability and injects urgent replacement task", () => {
    const intent = parseConstraintIntent("The caterer cancelled.", initialPlan);
    const proposals = generateReplanningProposals(initialPlan, intent);
    const proposal = proposals[0];

    const caterer = proposal.revisedPlan.vendors.find((v) => v.category === "caterer");
    expect(caterer?.bookingStatus).toBe("cancelled");

    const replacementTask = proposal.revisedPlan.tasks.find(
      (t) => t.id === "task-emergency-caterer"
    );
    expect(replacementTask).toBeDefined();
    expect(replacementTask?.priority).toBe("urgent");
  });
});
