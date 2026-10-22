import { describe, it, expect } from "vitest";
import {
  calculateBudgetSummary,
  optimizeBudget,
} from "../lib/budget/budgetEngine";
import {
  rupeesToPaise,
  paiseToRupees,
  formatINR,
  addMoney,
  subtractMoney,
} from "../lib/budget/moneyUtils";
import { BudgetItem, EventProfile } from "../lib/types/event";

describe("Budget Intelligence Engine", () => {
  const sampleProfile: EventProfile = {
    id: "test-ep",
    name: "Sister's Anime Birthday",
    type: "birthday",
    date: "2026-11-20",
    time: "18:00",
    location: { city: "Pune", venueType: "outdoor" },
    guestCount: 60,
    totalBudgetMinor: rupeesToPaise(40000), // ₹40,000 = 4,000,000 paise
    currency: "INR",
    theme: "Anime",
    dietaryPreferences: ["vegetarian"],
    accessibilityRequirements: [],
    mustHaves: ["Anime-Themed Decor", "Vegetarian Food"],
    excludedFeatures: [],
    priorities: ["food", "decor", "budget"],
    notes: "",
  };

  const sampleItems: BudgetItem[] = [
    {
      id: "b1",
      category: "venue",
      name: "Lawn Rental",
      estimatedCostMinor: rupeesToPaise(8000),
      actualCostMinor: rupeesToPaise(8000),
      flexible: false,
    },
    {
      id: "b2",
      category: "food_beverage",
      name: "Vegetarian Food Catering",
      estimatedCostMinor: rupeesToPaise(18000),
      actualCostMinor: rupeesToPaise(17500),
      flexible: false,
      isProtected: true,
    },
    {
      id: "b3",
      category: "decorations",
      name: "Anime-Themed Decor",
      estimatedCostMinor: rupeesToPaise(5000),
      actualCostMinor: rupeesToPaise(5000),
      flexible: true,
      isProtected: true,
    },
    {
      id: "b4",
      category: "photography",
      name: "Freelance Photographer",
      estimatedCostMinor: rupeesToPaise(3500),
      actualCostMinor: rupeesToPaise(3500),
      flexible: true,
    },
    {
      id: "b5",
      category: "entertainment",
      name: "Sound System Rental",
      estimatedCostMinor: rupeesToPaise(1500),
      actualCostMinor: rupeesToPaise(1500),
      flexible: true,
    },
    {
      id: "b6",
      category: "contingency_reserve",
      name: "Contingency Fund",
      estimatedCostMinor: rupeesToPaise(4000),
      actualCostMinor: 0,
      flexible: true,
    },
  ];

  it("calculates totals, actuals, and remaining balances accurately without floating point error", () => {
    const summary = calculateBudgetSummary(
      rupeesToPaise(40000),
      sampleItems,
      sampleProfile.guestCount
    );

    // Sum: 8000 + 18000 + 5000 + 3500 + 1500 + 4000 = 40,000
    expect(paiseToRupees(summary.totalEstimatedMinor)).toBe(40000);
    // Actuals: 8000 + 17500 + 5000 + 3500 + 1500 + 0 = 35,500
    expect(paiseToRupees(summary.totalActualMinor)).toBe(35500);
    expect(paiseToRupees(summary.remainingEstimatedMinor)).toBe(0);
    expect(paiseToRupees(summary.remainingActualMinor)).toBe(4500);
    expect(summary.isOverspent).toBe(false);
    expect(summary.isFeasible).toBe(true);
    expect(summary.contingencyPercent).toBe(10); // 4000/40000 = 10%
  });

  it("detects overspending and computes deficit correctly", () => {
    // Add extra ₹5,000 item
    const overspentItems: BudgetItem[] = [
      ...sampleItems,
      {
        id: "b7",
        category: "miscellaneous",
        name: "Extra Fireworks",
        estimatedCostMinor: rupeesToPaise(5000),
        actualCostMinor: 0,
        flexible: true,
      },
    ];

    const summary = calculateBudgetSummary(
      rupeesToPaise(40000),
      overspentItems,
      sampleProfile.guestCount
    );

    expect(summary.isOverspent).toBe(true);
    expect(summary.isFeasible).toBe(false);
    expect(paiseToRupees(summary.deficitMinor)).toBe(5000);
    expect(summary.warnings.length).toBeGreaterThan(0);
    expect(summary.warnings[0]).toContain("Budget exceeded by ₹5,000");
  });

  it("editing an item cost immediately reflects in totals", () => {
    const modifiedItems = sampleItems.map((item) =>
      item.id === "b4" ? { ...item, estimatedCostMinor: rupeesToPaise(2500) } : item
    );

    const summary = calculateBudgetSummary(
      rupeesToPaise(40000),
      modifiedItems,
      sampleProfile.guestCount
    );

    expect(paiseToRupees(summary.totalEstimatedMinor)).toBe(39000);
    expect(paiseToRupees(summary.remainingEstimatedMinor)).toBe(1000);
  });

  it("optimizes budget reduction while strictly preserving protected requirements", () => {
    const targetBudget = rupeesToPaise(30000); // Reduce from 40k to 30k
    const optResult = optimizeBudget(sampleItems, targetBudget, sampleProfile);

    // Verify reduction reached or came close to target
    expect(optResult.newEstimatedMinor).toBeLessThanOrEqual(targetBudget + rupeesToPaise(1500));
    expect(optResult.savingsAchievedMinor).toBeGreaterThan(0);

    // Protected must-haves must not be deleted or reduced below safety
    const vegFood = optResult.optimizedItems.find((i) => i.id === "b2");
    expect(vegFood).toBeDefined();
    expect(vegFood?.isProtected).toBe(true);
    // At least ₹200/guest for 60 guests = ₹12,000
    expect(paiseToRupees(vegFood!.estimatedCostMinor)).toBeGreaterThanOrEqual(12000);

    // Protected anime decor must not be eliminated
    const animeDecor = optResult.optimizedItems.find((i) => i.id === "b3");
    expect(animeDecor).toBeDefined();
    expect(animeDecor?.isProtected).toBe(true);

    // Flexible photography and sound should have absorbed reductions
    const photo = optResult.optimizedItems.find((i) => i.id === "b4");
    expect(photo!.estimatedCostMinor).toBeLessThan(rupeesToPaise(3500));

    expect(optResult.unviolatedMustHaves).toContain("Anime-Themed Decor");
    expect(optResult.unviolatedMustHaves).toContain("Vegetarian Food");
  });

  it("flags infeasible budget targets when constraints cannot be met", () => {
    // Attempting impossible budget of ₹5,000 for 60 guests with protected venue and food
    const impossibleBudget = rupeesToPaise(5000);
    const optResult = optimizeBudget(sampleItems, impossibleBudget, sampleProfile);

    expect(optResult.isFeasible).toBe(false);
    expect(optResult.deficitRemainingMinor).toBeGreaterThan(0);
    expect(optResult.conflicts.length).toBeGreaterThan(0);
    expect(optResult.conflicts[0]).toContain("Cannot safely reduce budget");
  });

  it("handles formatting and monetary arithmetic helpers consistently", () => {
    expect(formatINR(rupeesToPaise(40000))).toBe("₹40,000");
    expect(formatINR(rupeesToPaise(150000))).toBe("₹1,50,000");
    expect(formatINR(rupeesToPaise(500.5), true)).toBe("₹500.50");

    expect(addMoney(rupeesToPaise(10), rupeesToPaise(20))).toBe(rupeesToPaise(30));
    expect(subtractMoney(rupeesToPaise(50), rupeesToPaise(15))).toBe(rupeesToPaise(35));
  });
});
