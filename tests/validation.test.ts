import { describe, it, expect } from "vitest";
import {
  EventProfileSchema,
  BudgetItemSchema,
  TaskSchema,
  EventPlanSchema,
} from "../lib/schemas/eventSchemas";
import { processEventIntake, generateFullEventPlan } from "../lib/ai/aiService";
import { createCanonicalEventPlan } from "../lib/persistence/defaultEvent";

describe("Validation & AI Fallback Architecture", () => {
  it("rejects invalid event profile inputs with informative Zod errors", () => {
    const invalidProfile = {
      name: "X", // too short (< 2 chars)
      date: "invalid-date", // invalid format
      guestCount: -5, // negative guest count
      totalBudgetMinor: 50, // below minimum threshold
    };

    const result = EventProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.name).toBeDefined();
      expect(fieldErrors.date).toBeDefined();
      expect(fieldErrors.guestCount).toBeDefined();
      expect(fieldErrors.totalBudgetMinor).toBeDefined();
    }
  });

  it("validates canonical event plan against master EventPlanSchema", () => {
    const canonical = createCanonicalEventPlan();
    const result = EventPlanSchema.safeParse(canonical);
    expect(result.success).toBe(true);
  });

  it("operates in deterministic demo mode when GEMINI_API_KEY is not provided", async () => {
    const userQuery =
      "I'm planning my sister's birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food.";

    const intakeResult = await processEventIntake(userQuery);

    expect(intakeResult.isDemo).toBe(true);
    expect(intakeResult.extractedProfile.guestCount).toBe(60);
    expect(intakeResult.extractedProfile.location?.city).toBe("Pune");
    expect(intakeResult.extractedProfile.location?.venueType).toBe("outdoor");
    expect(intakeResult.extractedProfile.theme).toContain("Anime");
    expect(intakeResult.extractedProfile.dietaryPreferences).toContain("vegetarian");
    expect(intakeResult.isComplete).toBe(true);
  });

  it("generates a full validated event plan in demo mode without any external network call", async () => {
    const partialProfile = {
      name: "Sister's Anime Birthday",
      guestCount: 60,
      totalBudgetMinor: 4000000,
      location: { city: "Pune", venueType: "outdoor" as const },
      theme: "Anime & Manga",
      dietaryPreferences: ["vegetarian" as const],
    };

    const genResult = await generateFullEventPlan(partialProfile);

    expect(genResult.isDemo).toBe(true);
    expect(genResult.plan.budgetItems.length).toBeGreaterThanOrEqual(6);
    expect(genResult.plan.tasks.length).toBeGreaterThanOrEqual(7);
    expect(genResult.plan.ideas.length).toBeGreaterThanOrEqual(5);

    // Verify schema validation passes
    const validation = EventPlanSchema.safeParse(genResult.plan);
    expect(validation.success).toBe(true);
  });
});
