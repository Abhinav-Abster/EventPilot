import { describe, it, expect } from "vitest";
import {
  parseConstraintIntent,
  generateReplanningProposals,
} from "../lib/replanning/replanningEngine";
import {
  parseVendorCancellationIntent,
  parseGuestCountIntent,
} from "../lib/replanning/intentParsers";
import { calculateBudgetSummary, optimizeBudget } from "../lib/budget/budgetEngine";
import { computeItemReduction } from "../lib/budget/optimizationHelpers";
import { buildBudgetWarningsAndTips } from "../lib/budget/summaryHelpers";
import { normalizePlanOutput } from "../lib/ai/aiService";
import { normalizeProfile } from "../lib/ai/normalizers/normalizeProfile";
import { requestAI } from "../lib/ai/client";
import { createReferenceEventPlan, createCustomEventPlan } from "../lib/persistence/defaultEvent";
import { loadStoredPlans } from "../lib/persistence/storage";
import { sortTasksByExecutionOrder, recalculateSchedule } from "../lib/timeline/timelineEngine";
import { generatePersonalizedIdeas } from "../lib/ideas/ideaEngine";
import { EventPlan, Task, BudgetItem } from "../lib/types/event";

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

  describe("intentParsers: parseVendorCancellationIntent and parseGuestCountIntent", () => {
    it("parses vendor cancellation keywords accurately", () => {
      const resCater = parseVendorCancellationIntent("caterer cancelled", "caterer cancelled");
      expect(resCater?.cancelledVendorCategory).toBe("caterer");

      const resPhoto = parseVendorCancellationIntent(
        "photographer unavailable",
        "photo unavailable"
      );
      expect(resPhoto?.cancelledVendorCategory).toBe("photographer");

      const resDecor = parseVendorCancellationIntent("decorator backed out", "decor backed out");
      expect(resDecor?.cancelledVendorCategory).toBe("decorator");
    });

    it("parses guest count modifiers correctly", () => {
      const addRes = parseGuestCountIntent("15 more guests", "15 more guests", plan);
      expect(addRes?.newGuestCount).toBe(plan.profile.guestCount + 15);

      const lessRes = parseGuestCountIntent("decrease guests by 10", "decrease guests by 10", plan);
      expect(lessRes?.newGuestCount).toBe(plan.profile.guestCount - 10);
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
      const food = res.optimizedItems.find((i) => i.id === "bi-catering");
      expect(food).toBeDefined();
      expect(food?.isProtected).toBe(true);
    });
  });

  describe("computeItemReduction", () => {
    it("computes item reduction respecting item category limits and protection", () => {
      const decorItem: BudgetItem = {
        id: "bi-decor",
        category: "decorations",
        name: "Stage Backdrop",
        estimatedCostMinor: 100000,
        actualCostMinor: 0,
        flexible: true,
        isProtected: false,
      };
      const resUnprotected = computeItemReduction(decorItem, 80000, plan.profile);
      expect(resUnprotected.reductionMinor).toBe(50000);

      const protectedDecor = { ...decorItem, isProtected: true };
      const resProtected = computeItemReduction(protectedDecor, 80000, plan.profile);
      expect(resProtected.reductionMinor).toBe(35000);
    });
  });

  describe("buildBudgetWarningsAndTips", () => {
    it("generates warnings and tips based on spending thresholds", () => {
      const mockBreakdown = {
        venue: { estimatedMinor: 4000000, actualMinor: 0, count: 1, percentageOfBudget: 40 },
        food_beverage: { estimatedMinor: 100000, actualMinor: 0, count: 1, percentageOfBudget: 1 },
        decorations: { estimatedMinor: 3000000, actualMinor: 0, count: 1, percentageOfBudget: 30 },
        photography: { estimatedMinor: 2500000, actualMinor: 0, count: 1, percentageOfBudget: 25 },
        entertainment: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
        invitations: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
        transportation: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
        contingency_reserve: {
          estimatedMinor: 100000,
          actualMinor: 0,
          count: 1,
          percentageOfBudget: 1,
        },
        miscellaneous: { estimatedMinor: 0, actualMinor: 0, count: 0, percentageOfBudget: 0 },
      };
      const res = buildBudgetWarningsAndTips(mockBreakdown, 10000000, 10500000, 50, 500000, 1);
      expect(res.warnings.some((w) => w.includes("Budget exceeded"))).toBe(true);
      expect(res.warnings.some((w) => w.includes("Contingency buffer"))).toBe(true);
      expect(res.savingsTips.length).toBeGreaterThan(0);
    });
  });

  describe("normalizeProfile", () => {
    it("handles minimal/empty input with sensible defaults", () => {
      const p = normalizeProfile({});
      expect(p.id).toMatch(/^ep-/);
      expect(p.name).toBe("Celebration Event");
      expect(p.type).toBe("other");
      expect(p.guestCount).toBe(50);
      expect(p.totalBudgetMinor).toBe(4000000);
      expect(p.location.city).toBe("Pune");
      expect(p.location.venueType).toBe("outdoor");
      expect(p.dietaryPreferences).toContain("vegetarian");
    });

    it("clamps guest counts and handles numeric budget scaling", () => {
      const pZero = normalizeProfile({ guestCount: -10, totalBudgetMinor: 50 });
      expect(pZero.guestCount).toBe(1);
      expect(pZero.totalBudgetMinor).toBe(10000);

      const pLarge = normalizeProfile({ guestCount: 10000, totalBudgetMinor: 500 });
      expect(pLarge.guestCount).toBe(5000);
      expect(pLarge.totalBudgetMinor).toBe(50000);
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

  describe("timelineEngine: sortTasksByExecutionOrder and recalculateSchedule", () => {
    it("sorts tasks topologically by dependency and recalculates schedule", () => {
      const taskA: Task = {
        id: "task-a",
        title: "Initial Task",
        description: "",
        category: "venue",
        dueDate: "2026-11-20",
        relativeDays: -10,
        priority: "medium",
        status: "completed",
        isOverdue: false,
        isBlocked: false,
        dependencies: [],
      };
      const taskB: Task = {
        id: "task-b",
        title: "Dependent Task",
        description: "",
        category: "venue",
        dueDate: "2026-11-25",
        relativeDays: -5,
        priority: "medium",
        status: "todo",
        isOverdue: false,
        isBlocked: false,
        dependencies: ["task-a"],
      };
      const sorted = sortTasksByExecutionOrder([taskB, taskA]);
      expect(sorted[0].id).toBe("task-a");
      expect(sorted[1].id).toBe("task-b");

      const sched = recalculateSchedule([taskA, taskB], "2026-11-30", "2026-11-01");
      expect(sched.updatedTasks.length).toBe(2);
      expect(sched.hasWarnings).toBe(false);
    });
  });

  describe("defaultEvent: createCustomEventPlan", () => {
    it("creates custom event plan with proportional budget breakdown", () => {
      const custom = createCustomEventPlan("Tech Meetup", "corporate", {
        totalBudgetMinor: 10000000,
        guestCount: 100,
      });
      expect(custom.profile.name).toBe("Tech Meetup");
      expect(custom.profile.type).toBe("corporate");
      expect(custom.profile.guestCount).toBe(100);
      expect(custom.profile.totalBudgetMinor).toBe(10000000);
      expect(custom.budgetItems.length).toBe(4);
      const totalEstimated = custom.budgetItems.reduce((acc, i) => acc + i.estimatedCostMinor, 0);
      expect(totalEstimated).toBe(10000000);
    });
  });

  describe("storage: loadStoredPlans", () => {
    it("loads reference plan when storage is empty", () => {
      const result = loadStoredPlans();
      expect(result.loadedPlans.length).toBeGreaterThan(0);
      expect(result.activeId).toBeDefined();
    });
  });

  describe("client: requestAI", () => {
    it("requestAI throws AIRequestError when fetch encounters network error", async () => {
      await expect(requestAI("/api/non-existent-mock-endpoint", {})).rejects.toThrow();
    });
  });

  describe("ideas: generatePersonalizedIdeas", () => {
    it("generates 7 deterministic ideas tailored to profile", () => {
      const ideas = generatePersonalizedIdeas(plan.profile);
      expect(ideas.length).toBe(7);
      expect(ideas.map((i) => i.category)).toEqual([
        "theme",
        "menu",
        "decor",
        "activities",
        "invitation",
        "return_gifts",
        "weather_contingency",
      ]);
    });
  });
});
