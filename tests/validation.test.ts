import { describe, it, expect } from "vitest";
import { EventProfileSchema, EventPlanSchema } from "../lib/schemas/eventSchemas";
import {
  processEventIntake,
  generateFullEventPlan,
  normalizeProfile,
  normalizePlanOutput,
} from "../lib/ai/aiService";
import { normalizeDiets } from "../lib/ai/dietNormalizer";
import { createReferenceEventPlan } from "../lib/persistence/defaultEvent";

describe("Validation & Gemini configuration", () => {
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

  it("validates the reference event plan against master EventPlanSchema", () => {
    const referencePlan = createReferenceEventPlan();
    const result = EventPlanSchema.safeParse(referencePlan);
    expect(result.success).toBe(true);
  });

  it("reports a configuration error when GEMINI_API_KEY is not provided", async () => {
    const userQuery =
      "I'm planning my sister's birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food.";

    await expect(processEventIntake(userQuery)).rejects.toThrow("Gemini is not configured");
  });

  it("does not generate a plan when Gemini is not configured", async () => {
    const partialProfile = {
      name: "Sister's Anime Birthday",
      guestCount: 60,
      totalBudgetMinor: 4000000,
      location: { city: "Pune", venueType: "outdoor" as const },
      theme: "Anime & Manga",
      dietaryPreferences: ["vegetarian" as const],
    };

    await expect(generateFullEventPlan(partialProfile)).rejects.toThrow("Gemini is not configured");
  });

  it("normalizes malformed profile and AI response data so it strictly passes EventPlanSchema validation", () => {
    const messyProfile = {
      name: "A", // too short
      type: "birthday party",
      date: "not-a-date",
      guestCount: "75" as unknown as number,
      totalBudgetMinor: 5000000,
      dietaryPreferences: ["pure veg", "halal"],
      location: { city: "" },
    };

    const normalizedProf = normalizeProfile(messyProfile);
    expect(EventProfileSchema.safeParse(normalizedProf).success).toBe(true);
    expect(normalizedProf.dietaryPreferences).toContain("vegetarian");
    expect(normalizedProf.dietaryPreferences).toContain("halal");
    expect(normalizedProf.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(normalizedProf.location.city.length).toBeGreaterThan(0);

    const rawAiOutput = {
      budgetItems: [
        { name: "Custom Anime Cake", category: "cake", estimatedCostMinor: 300000 },
        { name: "Live DJ & Sound", category: "music", estimatedCostMinor: 150000 },
        { name: "Lawn Venue", category: "venue", estimatedCostMinor: 2000000 },
        { name: "Catering", category: "catering", estimatedCostMinor: 3500000 }, // Total 59.5k > 50k budget!
      ],
      tasks: [
        {
          title: "Book DJ",
          category: "entertainment",
          relativeDays: -10,
          vendorId: null,
          estimatedCostMinor: null,
        },
        { title: "Order Cake", category: "catering", relativeDays: -5 },
      ],
      vendors: [
        {
          name: "Sugar Bakery",
          category: "bakery",
          contact: { phone: 9876543210, contactPerson: "Anita" },
          bookingStatus: "pending_review",
        },
      ],
      ideas: [
        {
          title: "Anime Trivia Quiz",
          category: "games",
          description: "Fun quiz",
          whyItFits: "Anime theme",
          estimatedCostMinor: 0,
          costRangeText: null,
        },
      ],
    };

    const normalizedPlan = normalizePlanOutput(rawAiOutput, normalizedProf);
    const fullPlanCandidate = {
      profile: normalizedPlan.normalizedProfile,
      budgetItems: normalizedPlan.budgetItems,
      tasks: normalizedPlan.tasks,
      vendors: normalizedPlan.vendors,
      ideas: normalizedPlan.ideas,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    const planValidation = EventPlanSchema.safeParse(fullPlanCandidate);
    expect(planValidation.success).toBe(true);

    // Verify category mapping
    expect(normalizedPlan.budgetItems.find((b) => b.name === "Custom Anime Cake")?.category).toBe(
      "food_beverage"
    );
    expect(normalizedPlan.budgetItems.find((b) => b.name === "Live DJ & Sound")?.category).toBe(
      "entertainment"
    );

    // Verify vendor phone became string and bookingStatus defaulted safely
    const bakeryVendor = normalizedPlan.vendors.find((v) => v.name === "Sugar Bakery");
    expect(typeof bakeryVendor?.contact.phone).toBe("string");
    expect(bakeryVendor?.category).toBe("caterer");

    // Verify task without nulls
    const djTask = normalizedPlan.tasks.find((t) => t.title === "Book DJ");
    expect(djTask?.vendorId).toBeUndefined();

    // Verify total budget was auto-balanced to not exceed totalBudgetMinor
    const totalEst = normalizedPlan.budgetItems.reduce(
      (acc, item) => acc + item.estimatedCostMinor,
      0
    );
    expect(totalEst).toBeLessThanOrEqual(normalizedProf.totalBudgetMinor);
  });
});

describe("Dietary Normalization & Vegan Classification Fix", () => {
  it("correctly classifies 'vegan' as 'vegan' (bug fix verification)", () => {
    expect(normalizeDiets(["vegan"])).toEqual(["vegan"]);
    expect(normalizeDiets(["Vegan"])).toEqual(["vegan"]);
    expect(normalizeDiets(["100% vegan food"])).toEqual(["vegan"]);

    const profile = normalizeProfile({ dietaryPreferences: ["vegan"] });
    expect(profile.dietaryPreferences).toEqual(["vegan"]);
  });

  it("normalizes vegetarian and veg aliases", () => {
    expect(normalizeDiets(["vegetarian"])).toEqual(["vegetarian"]);
    expect(normalizeDiets(["veg"])).toEqual(["vegetarian"]);
    expect(normalizeDiets(["pure veg"])).toEqual(["vegetarian"]);
  });

  it("normalizes non-vegetarian, non veg, and meat aliases", () => {
    expect(normalizeDiets(["non-vegetarian"])).toEqual(["non-vegetarian"]);
    expect(normalizeDiets(["non veg"])).toEqual(["non-vegetarian"]);
    expect(normalizeDiets(["meat"])).toEqual(["non-vegetarian"]);
  });

  it("normalizes jain, halal, gluten-free, and nut allergy", () => {
    expect(normalizeDiets(["jain"])).toEqual(["jain"]);
    expect(normalizeDiets(["halal"])).toEqual(["halal"]);
    expect(normalizeDiets(["gluten free"])).toEqual(["gluten-free"]);
    expect(normalizeDiets(["gluten-free"])).toEqual(["gluten-free"]);
    expect(normalizeDiets(["nut allergy"])).toEqual(["nut-allergy"]);
  });

  it("removes duplicate dietary preferences", () => {
    expect(normalizeDiets(["vegan", "Vegan", "VEGAN"])).toEqual(["vegan"]);
    expect(normalizeDiets(["veg", "vegetarian", "pure veg"])).toEqual(["vegetarian"]);
  });

  it("ignores non-string and empty items safely", () => {
    expect(normalizeDiets([123, null, undefined, {}, "", "  ", "vegan"])).toEqual(["vegan"]);
    expect(normalizeDiets("vegan")).toEqual(["vegan"]);
  });

  it("preserves fallback behavior when empty", () => {
    expect(normalizeDiets([])).toEqual([]);
    expect(normalizeDiets(null)).toEqual([]);
    expect(normalizeDiets(undefined)).toEqual([]);

    // normalizeProfile falls back to default vegetarian
    const defaultProfile = normalizeProfile({});
    expect(defaultProfile.dietaryPreferences).toEqual(["vegetarian"]);
  });
});
