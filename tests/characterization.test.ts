import { describe, it, expect } from "vitest";
import {
  parseConstraintIntent,
  generateReplanningProposals,
} from "../lib/replanning/replanningEngine";
import { calculateBudgetSummary, optimizeBudget } from "../lib/budget/budgetEngine";
import { normalizePlanOutput } from "../lib/ai/aiService";
import { createReferenceEventPlan } from "../lib/persistence/defaultEvent";
import { EventPlan } from "../lib/types/event";

describe("Characterization Tests: Baseline Behavior Preservation", () => {
  const plan: EventPlan = createReferenceEventPlan();

  describe("parseConstraintIntent", () => {
    it("parses budget reduction correctly", () => {
      const intent = parseConstraintIntent("Reduce budget to 30000", plan);
      expect(intent.changeType).toBe("budget_change");
      expect(intent.targetBudgetMinor).toBe(3000000);
    });

    it("parses budget increase correctly", () => {
      const intent = parseConstraintIntent("budget is 50000", plan);
      expect(intent.changeType).toBe("budget_change");
      expect(intent.targetBudgetMinor).toBe(5000000);
    });

    it("parses guest count reduction", () => {
      const intent = parseConstraintIntent("guests now 40", plan);
      expect(intent.changeType).toBe("guest_count_change");
      expect(intent.newGuestCount).toBe(40);
    });

    it("parses venue change to indoor due to rain", () => {
      const intent = parseConstraintIntent("It is raining so move indoors", plan);
      expect(intent.changeType).toBe("venue_change");
      expect(intent.newVenueType).toBe("indoor");
    });

    it("parses vendor cancellation", () => {
      const intent = parseConstraintIntent("Our caterer cancelled at the last minute", plan);
      expect(intent.changeType).toBe("vendor_cancellation");
    });

    it("parses date shift", () => {
      const intent = parseConstraintIntent("Postpone the event by 5 days", plan);
      expect(intent.changeType).toBe("date_change");
    });
  });

  describe("generateReplanningProposals", () => {
    it("produces deterministic proposals for budget reduction", () => {
      const intent = parseConstraintIntent("Reduce budget to 30000", plan);
      const proposals = generateReplanningProposals(plan, intent);
      expect(proposals.length).toBeGreaterThan(0);
      const first = proposals[0];
      expect(first.strategy).toBe("cost_reduction");
      expect(first.diffs.length).toBeGreaterThan(0);
      expect(first.revisedPlan.profile.totalBudgetMinor).toBe(3000000);
    });

    it("produces proposals for venue weather shift", () => {
      const intent = parseConstraintIntent(
        "Heavy rain expected, shift to indoor banquet hall",
        plan
      );
      const proposals = generateReplanningProposals(plan, intent);
      expect(proposals.length).toBeGreaterThan(0);
      const proposal = proposals[0];
      expect(proposal.revisedPlan.profile.location.venueType).toBe("indoor");
      expect(proposal.diffs.some((d) => d.type === "profile" && d.field === "venueType")).toBe(
        true
      );
    });

    it("produces proposals for vendor cancellation", () => {
      const intent = parseConstraintIntent("The decorator cancelled", plan);
      const proposals = generateReplanningProposals(plan, intent);
      expect(proposals.length).toBeGreaterThan(0);
      const proposal = proposals[0];
      expect(proposal.revisedPlan.tasks.some((t) => t.id.startsWith("task-emergency-"))).toBe(true);
    });
  });

  describe("calculateBudgetSummary and optimizeBudget", () => {
    it("computes accurate summary for reference plan", () => {
      const summary = calculateBudgetSummary(
        plan.profile.totalBudgetMinor,
        plan.budgetItems,
        plan.profile.guestCount
      );
      expect(summary.totalEstimatedMinor).toBe(plan.profile.totalBudgetMinor);
      expect(summary.isOverspent).toBe(false);
      expect(summary.isFeasible).toBe(true);
    });

    it("optimizes budget deterministically while preserving protected items", () => {
      const targetMinor = 3000000;
      const res = optimizeBudget(plan.budgetItems, targetMinor, plan.profile);
      expect(res.newEstimatedMinor).toBeLessThanOrEqual(targetMinor + 150000);
      expect(res.unviolatedMustHaves.length).toBeGreaterThan(0);
      // Must not eliminate protected food or decor
      const food = res.optimizedItems.find((i) => i.id === "bi-catering");
      expect(food).toBeDefined();
      expect(food?.isProtected).toBe(true);
    });
  });

  describe("normalizePlanOutput", () => {
    it("normalizes malformed raw AI plan payload without throwing", () => {
      const rawOutput = {
        budgetItems: [
          { name: "Catering", category: "catering", estimatedCostMinor: 2500000 },
          { name: "DJ", category: "music", estimatedCostMinor: 1000000 },
        ],
        tasks: [{ title: "Book Hall", category: "venue", priority: "HIGH", relativeDays: -15 }],
        vendors: [
          { name: "V1", category: "hall", bookingStatus: "booked", paymentStatus: "unpaid" },
        ],
        ideas: [{ title: "Idea 1", category: "decor", description: "Nice decor" }],
      };

      const normalized = normalizePlanOutput(rawOutput, plan.profile);
      expect(normalized.budgetItems[0].category).toBe("food_beverage");
      expect(normalized.budgetItems[1].category).toBe("entertainment");
      expect(normalized.tasks[0].priority).toBe("high");
      expect(normalized.tasks[0].category).toBe("venue");
      expect(normalized.vendors[0].category).toBe("venue");
      expect(normalized.ideas[0].category).toBe("decor");
    });
  });
});
