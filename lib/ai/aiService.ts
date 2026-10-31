import { DEFAULT_GEMINI_MODEL, getGeminiClient, GeminiConfigurationError } from "./geminiClient";
import { EVENT_INTAKE_SYSTEM_PROMPT, PLAN_GENERATION_SYSTEM_PROMPT, REPLANNING_SYSTEM_PROMPT } from "./prompts";
import { EventPlan, EventProfile, ReplanningProposal } from "../types/event";
import { EventPlanSchema } from "../schemas/eventSchemas";
import { parseConstraintIntent, generateReplanningProposals } from "../replanning/replanningEngine";
import { addDaysToDate } from "../timeline/timelineEngine";
import { buildCompactReplanningSummary } from "./replanningSummary";
import { normalizeDiets } from "./normalizers";
import { DEFAULT_CITY, DEFAULT_DIETARY_PREFERENCES } from "../config/constants";

export { buildCompactReplanningSummary, normalizeDiets };

export interface IntakeResult {
  reply: string;
  extractedProfile: Partial<EventProfile>;
  isComplete: boolean;
  missingFields: string[];
}

export interface PlanGenerationResult {
  plan: EventPlan;
  modelUsed: string;
}

export interface ReplanningResult {
  proposals: ReplanningProposal[];
  explanation: string;
}

export class AIServiceError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "AIServiceError";
  }
}

function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; message?: string; code?: string };
  if (err.name === "RequestTimeoutError" || err.name === "TimeoutError") return true;
  if (err.code === "ETIMEDOUT") return true;
  if (typeof err.message === "string" && /timed?\s*out|timeout/i.test(err.message)) return true;
  return false;
}

function providerError(error: unknown): AIServiceError {
  if (error instanceof GeminiConfigurationError) {
    return new AIServiceError(error.message, 503);
  }

  if (isTimeoutError(error)) {
    return new AIServiceError(
      "The AI service timed out while generating a response. Please try again with a more concise request.",
      504
    );
  }

  const message = error instanceof Error ? error.message : "Unknown provider error";
  return new AIServiceError(`Gemini request failed: ${message}`, 502);
}

async function generateJson(prompt: string, timeoutMs = 45000): Promise<unknown> {
  try {
    const response = await getGeminiClient().models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 8192,
        httpOptions: { timeout: timeoutMs },
      },
    });

    if (!response.text) {
      throw new AIServiceError("Gemini returned an empty response.");
    }

    try {
      return JSON.parse(response.text);
    } catch {
      throw new AIServiceError("Gemini returned invalid JSON. Please try again.");
    }
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw providerError(error);
  }
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function asArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new AIServiceError(`Gemini did not return a ${field} list. Please try again.`);
  }
  return value;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function integer(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, Math.round(numberValue)) : fallback;
}

function signedInteger(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : fallback;
}

export function normalizeProfile(
  raw: Partial<EventProfile> | Record<string, unknown> | undefined
): EventProfile {
  const p = (raw || {}) as Record<string, unknown>;
  const validTypes = ["birthday", "wedding", "community", "corporate", "anniversary", "other"] as const;
  const rawType = typeof p.type === "string" ? p.type.toLowerCase().trim() : "";
  let type: (typeof validTypes)[number] = "other";
  for (const t of validTypes) {
    if (rawType.includes(t)) {
      type = t;
      break;
    }
  }

  // Date normalization: must be YYYY-MM-DD
  let date = typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : "";
  if (!date) {
    date = addDaysToDate(new Date().toISOString().slice(0, 10), 30);
  }

  // Dietary preferences normalization
  const sanitizedDiets = normalizeDiets(p.dietaryPreferences);
  const dietaryPreferences =
    sanitizedDiets.length > 0 ? sanitizedDiets : [...DEFAULT_DIETARY_PREFERENCES];

  // Priorities normalization
  const validPriorities = ["food", "decor", "photography", "entertainment", "venue", "budget"] as const;
  const priorities: (typeof validPriorities)[number][] = [];
  if (Array.isArray(p.priorities)) {
    for (const pr of p.priorities) {
      if (typeof pr === "string" && validPriorities.includes(pr.toLowerCase().trim() as any)) {
        priorities.push(pr.toLowerCase().trim() as any);
      }
    }
  }
  if (priorities.length === 0) {
    priorities.push("food", "decor", "budget");
  }

  // Location normalization
  const loc = (p.location && typeof p.location === "object" ? p.location : {}) as Record<string, unknown>;
  const city = typeof loc.city === "string" && loc.city.trim().length > 0 ? loc.city.trim() : DEFAULT_CITY;
  const rawVenue = typeof loc.venueType === "string" ? loc.venueType.toLowerCase() : "";
  const venueType = (["indoor", "outdoor", "hybrid", "unselected"].includes(rawVenue) ? rawVenue : "outdoor") as any;

  // Guest count
  const rawGuestCount = typeof p.guestCount === "number" ? p.guestCount : Number(p.guestCount);
  const guestCount = Number.isFinite(rawGuestCount)
    ? Math.min(5000, Math.max(1, Math.round(rawGuestCount)))
    : 50;

  // Budget in minor units (paise)
  let rawBudget = typeof p.totalBudgetMinor === "number" ? p.totalBudgetMinor : Number(p.totalBudgetMinor);
  let totalBudgetMinor = Number.isFinite(rawBudget) ? Math.round(rawBudget) : 4000000;
  if (totalBudgetMinor < 10000) {
    if (totalBudgetMinor > 0 && totalBudgetMinor < 1000) {
      totalBudgetMinor = totalBudgetMinor * 100;
    }
    if (totalBudgetMinor < 10000) {
      totalBudgetMinor = 10000;
    }
  }

  return {
    id: typeof p.id === "string" && p.id ? p.id : "ep-" + Math.random().toString(36).substring(2, 9),
    name: typeof p.name === "string" && p.name.trim().length >= 2 ? p.name.trim() : "Celebration Event",
    type,
    date,
    time: typeof p.time === "string" && p.time.trim() ? p.time.trim() : "18:00",
    location: {
      city,
      venueType,
      venueName: typeof loc.venueName === "string" && loc.venueName.trim() ? loc.venueName.trim() : undefined,
    },
    guestCount,
    totalBudgetMinor,
    currency: "INR",
    theme: typeof p.theme === "string" && p.theme.trim() ? p.theme.trim() : "General Celebration",
    dietaryPreferences,
    accessibilityRequirements: Array.isArray(p.accessibilityRequirements)
      ? p.accessibilityRequirements.filter((s): s is string => typeof s === "string")
      : [],
    mustHaves: Array.isArray(p.mustHaves)
      ? p.mustHaves.filter((s): s is string => typeof s === "string")
      : [],
    excludedFeatures: Array.isArray(p.excludedFeatures)
      ? p.excludedFeatures.filter((s): s is string => typeof s === "string")
      : [],
    priorities,
    notes: typeof p.notes === "string" ? p.notes : "",
  };
}

export function normalizePlanOutput(output: unknown, profile: Partial<EventProfile>) {
  const root = asRecord(output);
  const generated = asRecord(root?.plan) ?? asRecord(root?.eventPlan) ?? asRecord(root?.data) ?? root;
  if (!generated) {
    throw new AIServiceError("Gemini returned an invalid plan format. Please try again.");
  }

  const normalizedProfile = normalizeProfile(profile);
  const planDate = normalizedProfile.date;

  const validBudgetCategories = new Set([
    "venue",
    "food_beverage",
    "decorations",
    "photography",
    "entertainment",
    "invitations",
    "transportation",
    "miscellaneous",
    "contingency_reserve",
  ]);

  const budgetCategoryMap: Record<string, string> = {
    food: "food_beverage",
    catering: "food_beverage",
    beverage: "food_beverage",
    beverages: "food_beverage",
    drinks: "food_beverage",
    cake: "food_beverage",
    bakery: "food_beverage",
    dining: "food_beverage",
    decor: "decorations",
    decoration: "decorations",
    decorations: "decorations",
    flowers: "decorations",
    lighting: "decorations",
    stage: "decorations",
    photo: "photography",
    photos: "photography",
    photography: "photography",
    video: "photography",
    videography: "photography",
    media: "photography",
    entertainment: "entertainment",
    music: "entertainment",
    sound: "entertainment",
    audio: "entertainment",
    dj: "entertainment",
    artist: "entertainment",
    performer: "entertainment",
    venue: "venue",
    hall: "venue",
    lawn: "venue",
    space: "venue",
    rental: "venue",
    location: "venue",
    invitation: "invitations",
    invitations: "invitations",
    invites: "invitations",
    print: "invitations",
    stationery: "invitations",
    transport: "transportation",
    transportation: "transportation",
    logistics: "transportation",
    travel: "transportation",
    contingency: "contingency_reserve",
    contingency_reserve: "contingency_reserve",
    reserve: "contingency_reserve",
    buffer: "contingency_reserve",
    emergency: "contingency_reserve",
    misc: "miscellaneous",
    miscellaneous: "miscellaneous",
    other: "miscellaneous",
  };

  const validVendorCategories = new Set([
    "venue",
    "caterer",
    "decorator",
    "photographer",
    "entertainment",
    "transportation",
    "invitations",
    "other",
  ]);

  const vendorCategoryMap: Record<string, string> = {
    food: "caterer",
    catering: "caterer",
    caterer: "caterer",
    caterers: "caterer",
    bakery: "caterer",
    cake: "caterer",
    baker: "caterer",
    decor: "decorator",
    decoration: "decorator",
    decorator: "decorator",
    decorators: "decorator",
    florist: "decorator",
    flowers: "decorator",
    photo: "photographer",
    photos: "photographer",
    photography: "photographer",
    photographer: "photographer",
    photographers: "photographer",
    videographer: "photographer",
    entertainment: "entertainment",
    music: "entertainment",
    sound: "entertainment",
    dj: "entertainment",
    venue: "venue",
    hall: "venue",
    lawn: "venue",
    transport: "transportation",
    transportation: "transportation",
    cab: "transportation",
    cabs: "transportation",
    invitation: "invitations",
    invitations: "invitations",
    printer: "invitations",
    print: "invitations",
    other: "other",
  };

  const validIdeaCategories = new Set([
    "theme",
    "decor",
    "menu",
    "activities",
    "invitation",
    "return_gifts",
    "schedule",
    "weather_contingency",
  ]);

  const ideaCategoryMap: Record<string, string> = {
    theme: "theme",
    concept: "theme",
    decor: "decor",
    decoration: "decor",
    styling: "decor",
    menu: "menu",
    food: "menu",
    catering: "menu",
    drink: "menu",
    drinks: "menu",
    activities: "activities",
    activity: "activities",
    entertainment: "activities",
    games: "activities",
    fun: "activities",
    invitation: "invitation",
    invitations: "invitation",
    invite: "invitation",
    gift: "return_gifts",
    gifts: "return_gifts",
    favors: "return_gifts",
    favor: "return_gifts",
    return_gifts: "return_gifts",
    schedule: "schedule",
    timeline: "schedule",
    flow: "schedule",
    weather: "weather_contingency",
    weather_contingency: "weather_contingency",
    rain: "weather_contingency",
  };

  const rawBudgetItems = asArray(generated.budgetItems, "budget items");
  const budgetItems = (rawBudgetItems.length > 0 ? rawBudgetItems : [
    { name: "Venue Booking", category: "venue", estimatedCostMinor: Math.round(normalizedProfile.totalBudgetMinor * 0.25) },
    { name: "Food & Catering", category: "food_beverage", estimatedCostMinor: Math.round(normalizedProfile.totalBudgetMinor * 0.45) },
    { name: "Decorations & Theme", category: "decorations", estimatedCostMinor: Math.round(normalizedProfile.totalBudgetMinor * 0.15) },
    { name: "Contingency Buffer", category: "contingency_reserve", estimatedCostMinor: Math.round(normalizedProfile.totalBudgetMinor * 0.15) },
  ]).map((value, index) => {
    const item = asRecord(value) ?? {};
    const rawCategory = text(item.category, "miscellaneous").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const category = validBudgetCategories.has(rawCategory)
      ? rawCategory
      : budgetCategoryMap[rawCategory] ?? "miscellaneous";

    return {
      id: text(item.id, `ai-budget-${index + 1}`),
      category: category as any,
      name: text(item.name, `Planned expense ${index + 1}`),
      estimatedCostMinor: integer(item.estimatedCostMinor ?? item.costMinor ?? item.cost, 10000),
      actualCostMinor: integer(item.actualCostMinor, 0),
      flexible: typeof item.flexible === "boolean" ? item.flexible : true,
      isProtected: typeof item.isProtected === "boolean" ? item.isProtected : false,
      notes: text(item.notes, "Generated from the event requirements."),
    };
  });

  // Ensure total estimated doesn't exceed totalBudgetMinor
  const totalEstimated = budgetItems.reduce((acc, item) => acc + item.estimatedCostMinor, 0);
  if (totalEstimated > normalizedProfile.totalBudgetMinor && totalEstimated > 0) {
    const excess = totalEstimated - normalizedProfile.totalBudgetMinor;
    const flexibleItems = budgetItems.filter((i) => i.flexible && i.estimatedCostMinor > 0);
    if (flexibleItems.length > 0) {
      const flexibleTotal = flexibleItems.reduce((acc, i) => acc + i.estimatedCostMinor, 0);
      for (const item of flexibleItems) {
        const reduction = Math.round((item.estimatedCostMinor / flexibleTotal) * excess);
        item.estimatedCostMinor = Math.max(0, item.estimatedCostMinor - reduction);
      }
    } else {
      const ratio = normalizedProfile.totalBudgetMinor / totalEstimated;
      for (const item of budgetItems) {
        item.estimatedCostMinor = Math.max(0, Math.round(item.estimatedCostMinor * ratio));
      }
    }
  }

  const rawTasks = asArray(generated.tasks, "tasks");
  const tasks = (rawTasks.length > 0 ? rawTasks : [
    { title: "Confirm venue booking", category: "venue", relativeDays: -20 },
    { title: "Finalize menu and caterer", category: "catering", relativeDays: -14 },
    { title: "Send digital invitations", category: "invitations", relativeDays: -10 },
    { title: "Final checklist review", category: "general", relativeDays: -2 },
  ]).map((value, index) => {
    const task = asRecord(value) ?? {};
    const relativeDays = signedInteger(task.relativeDays ?? task.daysBeforeEvent, -7);
    const validPriorities = ["urgent", "high", "medium", "low"] as const;
    const priority = validPriorities.includes(text(task.priority).toLowerCase() as any)
      ? (text(task.priority).toLowerCase() as (typeof validPriorities)[number])
      : "medium";

    const validStatus = ["todo", "in_progress", "completed", "blocked"] as const;
    const status = validStatus.includes(text(task.status).toLowerCase() as any)
      ? (text(task.status).toLowerCase() as (typeof validStatus)[number])
      : "todo";

    const vendorId = typeof task.vendorId === "string" && task.vendorId.trim() ? task.vendorId.trim() : undefined;
    const estimatedCostMinor = task.estimatedCostMinor != null ? integer(task.estimatedCostMinor) : undefined;

    return {
      id: text(task.id, `ai-task-${index + 1}`),
      title: text(task.title, `Planning task ${index + 1}`),
      description: text(task.description, "Complete this event-planning task."),
      category: text(task.category, "general"),
      priority,
      relativeDays,
      dueDate: text(task.dueDate, addDaysToDate(planDate, relativeDays)),
      status,
      dependencies: Array.isArray(task.dependencies)
        ? task.dependencies.filter((dependency): dependency is string => typeof dependency === "string")
        : [],
      estimatedCostMinor,
      vendorId,
      isOverdue: typeof task.isOverdue === "boolean" ? task.isOverdue : false,
      isBlocked: typeof task.isBlocked === "boolean" ? task.isBlocked : false,
    };
  });

  const rawVendors = asArray(generated.vendors, "vendors");
  const vendors = rawVendors.map((value, index) => {
    const vendor = asRecord(value) ?? {};
    const rawCategory = text(vendor.category, "other").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const category = validVendorCategories.has(rawCategory)
      ? rawCategory
      : vendorCategoryMap[rawCategory] ?? "other";

    const rawContact = asRecord(vendor.contact) ?? {};
    const contact = {
      contactPerson: typeof rawContact.contactPerson === "string" && rawContact.contactPerson.trim()
        ? rawContact.contactPerson.trim()
        : undefined,
      phone: rawContact.phone != null && String(rawContact.phone).trim()
        ? String(rawContact.phone).trim()
        : undefined,
      email: typeof rawContact.email === "string" && rawContact.email.trim()
        ? rawContact.email.trim()
        : undefined,
    };

    const validBookingStatus = ["planned", "contacted", "quote_received", "shortlisted", "booked", "cancelled"] as const;
    const bookingStatus = validBookingStatus.includes(vendor.bookingStatus as any)
      ? (vendor.bookingStatus as (typeof validBookingStatus)[number])
      : "planned";

    const validPaymentStatus = ["unpaid", "advance_paid", "fully_paid"] as const;
    const paymentStatus = validPaymentStatus.includes(vendor.paymentStatus as any)
      ? (vendor.paymentStatus as (typeof validPaymentStatus)[number])
      : "unpaid";

    return {
      id: text(vendor.id, `ai-vendor-${index + 1}`),
      name: text(vendor.name, `Potential vendor ${index + 1}`),
      category: category as any,
      contact,
      estimatedQuoteMinor: integer(vendor.estimatedQuoteMinor ?? vendor.quoteMinor ?? vendor.estimatedCostMinor, 0),
      actualQuoteMinor: integer(vendor.actualQuoteMinor, 0),
      bookingStatus,
      paymentStatus,
      notes: text(vendor.notes, "Research and obtain a quote before booking."),
      relatedTaskIds: Array.isArray(vendor.relatedTaskIds)
        ? vendor.relatedTaskIds.filter((taskId): taskId is string => typeof taskId === "string")
        : [],
    };
  });

  const rawIdeas = asArray(generated.ideas, "ideas");
  const ideas = rawIdeas.map((value, index) => {
    const idea = asRecord(value) ?? {};
    const rawCategory = text(idea.category, "activities").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const category = validIdeaCategories.has(rawCategory)
      ? rawCategory
      : ideaCategoryMap[rawCategory] ?? "activities";

    const costRangeText = typeof idea.costRangeText === "string" && idea.costRangeText.trim()
      ? idea.costRangeText.trim()
      : undefined;

    return {
      id: text(idea.id, `ai-idea-${index + 1}`),
      category: category as any,
      title: text(idea.title, `Event idea ${index + 1}`),
      description: text(idea.description ?? idea.details, "A personalized suggestion for this event."),
      whyItFits: text(idea.whyItFits ?? idea.rationale, "It supports the event's stated priorities."),
      estimatedCostMinor: integer(idea.estimatedCostMinor ?? idea.costMinor ?? idea.cost, 0),
      costRangeText,
      implementationSteps: Array.isArray(idea.implementationSteps)
        ? idea.implementationSteps.filter((step): step is string => typeof step === "string")
        : [],
      constraints: Array.isArray(idea.constraints)
        ? idea.constraints.filter((constraint): constraint is string => typeof constraint === "string")
        : [],
      tradeOffs: Array.isArray(idea.tradeOffs)
        ? idea.tradeOffs.filter((tradeOff): tradeOff is string => typeof tradeOff === "string")
        : [],
      isSaved: typeof idea.isSaved === "boolean" ? idea.isSaved : false,
    };
  });

  return {
    normalizedProfile,
    budgetItems,
    tasks,
    vendors,
    ideas,
  };
}

export async function processEventIntake(
  userMessage: string,
  currentProfile: Partial<EventProfile> = {}
): Promise<IntakeResult> {
  const parsed = await generateJson(`${EVENT_INTAKE_SYSTEM_PROMPT}

Current profile state: ${JSON.stringify(currentProfile)}
User message: ${JSON.stringify(userMessage)}

Return only this JSON object:
{
  "reply": "string",
  "extractedProfile": { "name": "string", "type": "birthday|wedding|community|corporate|anniversary|other", "date": "YYYY-MM-DD", "location": { "city": "string", "venueType": "indoor|outdoor|hybrid" }, "guestCount": 0, "totalBudgetMinor": 0, "theme": "string", "dietaryPreferences": ["vegetarian"], "mustHaves": ["string"], "notes": "string" },
  "isComplete": false,
  "missingFields": ["string"]
}
Only include fields that were stated or can be inferred safely in extractedProfile.`);

  if (!parsed || typeof parsed !== "object") {
    throw new AIServiceError("Gemini returned an invalid intake result. Please try again.");
  }

  const result = parsed as Partial<IntakeResult>;
  if (typeof result.reply !== "string" || !result.extractedProfile || typeof result.extractedProfile !== "object") {
    throw new AIServiceError("Gemini returned an incomplete intake result. Please try again.");
  }

  // Clean extracted profile fields
  const extracted = result.extractedProfile as Partial<EventProfile>;
  const merged = { ...currentProfile, ...extracted };
  if (merged.dietaryPreferences) {
    const sanitizedDiets = normalizeDiets(merged.dietaryPreferences);
    if (sanitizedDiets.length > 0) {
      merged.dietaryPreferences = sanitizedDiets;
    }
  }

  return {
    reply: result.reply,
    extractedProfile: merged,
    isComplete: Boolean(result.isComplete),
    missingFields: Array.isArray(result.missingFields)
      ? result.missingFields.filter((field): field is string => typeof field === "string")
      : [],
  };
}

export async function generateFullEventPlan(
  profile: Partial<EventProfile>
): Promise<PlanGenerationResult> {
  const normalizedProfile = normalizeProfile(profile);
  const now = new Date().toISOString();

  const prompt = `${PLAN_GENERATION_SYSTEM_PROMPT}

Create a complete EventPilot plan for this profile:
${JSON.stringify(normalizedProfile)}

Strict Formatting and Constraints:
1. Return strictly JSON with budgetItems, tasks, vendors, and ideas arrays.
2. Amounts must be in paise (₹1 = 100 paise). The sum of all budget items' estimatedCostMinor MUST NOT exceed totalBudgetMinor (${normalizedProfile.totalBudgetMinor}).
3. Allowed Budget Categories: "venue", "food_beverage", "decorations", "photography", "entertainment", "invitations", "transportation", "miscellaneous", "contingency_reserve".
4. Allowed Vendor Categories: "venue", "caterer", "decorator", "photographer", "entertainment", "transportation", "invitations", "other".
5. Allowed Idea Categories: "theme", "decor", "menu", "activities", "invitation", "return_gifts", "schedule", "weather_contingency".
6. Every task must include id, title, description, category, priority ("urgent"|"high"|"medium"|"low"), relativeDays (negative integer indicating days relative to event date), dueDate (YYYY-MM-DD), status ("todo"), dependencies (array of strings).
7. Every budget item must include id, category, name, estimatedCostMinor, actualCostMinor (0), flexible (boolean), isProtected (boolean), notes.
8. Every vendor must include id, name, category, contact, estimatedQuoteMinor, actualQuoteMinor (0), bookingStatus ("planned"), paymentStatus ("unpaid"), notes, relatedTaskIds.
9. Every idea must include id, category, title, description, whyItFits, estimatedCostMinor, implementationSteps, constraints, tradeOffs.`;

  const parsed = await generateJson(prompt);
  const generated = normalizePlanOutput(parsed, normalizedProfile);

  const validation = EventPlanSchema.safeParse({
    profile: generated.normalizedProfile,
    budgetItems: generated.budgetItems,
    tasks: generated.tasks,
    vendors: generated.vendors,
    ideas: generated.ideas,
    createdAt: now,
    updatedAt: now,
    version: 1,
  });

  if (!validation.success) {
    console.error("Plan validation failed with issues:", JSON.stringify(validation.error.issues, null, 2));
    throw new AIServiceError(
      `Gemini returned a plan that did not pass validation: ${validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`
    );
  }

  const plan = validation.data as EventPlan;
  return { plan, modelUsed: DEFAULT_GEMINI_MODEL };
}

export async function executeReplanning(
  userQuery: string,
  currentPlan: EventPlan
): Promise<ReplanningResult> {
  const summary = buildCompactReplanningSummary(currentPlan, userQuery);
  const parsed = await generateJson(`${REPLANNING_SYSTEM_PROMPT}

Current event summary: ${JSON.stringify(summary)}
Requested change: ${JSON.stringify(userQuery)}

Identify the requested change and return only { "explanation": "a concise explanation of the request and its relevant planning trade-offs" }.`);

  if (!parsed || typeof parsed !== "object" || typeof (parsed as { explanation?: unknown }).explanation !== "string") {
    throw new AIServiceError("Gemini returned an invalid replanning analysis. Please try again.");
  }

  const intent = parseConstraintIntent(userQuery, currentPlan);
  return {
    proposals: generateReplanningProposals(currentPlan, intent),
    explanation: (parsed as { explanation: string }).explanation,
  };
}
