/**
 * Orchestrates end-to-end AI workflows: natural-language intake parsing, full event plan generation,
 * and constraint-driven replanning, backed by structured LLM responses and deterministic fallbacks.
 */
import { DEFAULT_GEMINI_MODEL } from "./geminiClient";
import {
  EVENT_INTAKE_SYSTEM_PROMPT,
  PLAN_GENERATION_SYSTEM_PROMPT,
  REPLANNING_SYSTEM_PROMPT,
} from "./prompts";
import { EventPlan, EventProfile, ReplanningProposal } from "../types/event";
import { EventPlanSchema } from "../schemas/eventSchemas";
import { parseConstraintIntent, generateReplanningProposals } from "../replanning/replanningEngine";
import { buildCompactReplanningSummary } from "./replanningSummary";
import { normalizeDiets } from "./normalizers";
import { AIServiceError, generateJson } from "./transport";
import { normalizeProfile } from "./normalizers/normalizeProfile";
import { normalizePlanOutput } from "./normalizers/normalizePlanOutput";

export {
  buildCompactReplanningSummary,
  normalizeDiets,
  normalizeProfile,
  normalizePlanOutput,
  AIServiceError,
};

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

/**
 * Parses free-form conversational event descriptions into normalized profile fields.
 * @param rawText User's unconstrained description of their event.
 * @param currentPlan Optional active plan to preserve existing constraints and preferences.
 * @returns Partially populated, sanitized event profile fields.
 */
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
  if (
    typeof result.reply !== "string" ||
    !result.extractedProfile ||
    typeof result.extractedProfile !== "object"
  ) {
    throw new AIServiceError("Gemini returned an incomplete intake result. Please try again.");
  }

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

/**
 * Synthesizes a comprehensive, cohesive event plan with budget items, timeline tasks, and vendor recommendations.
 * @param profile Validated event profile specifying parameters and constraints.
 * @returns A fully populated, schema-valid EventPlan object.
 */
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
    console.error(
      "Plan validation failed with issues:",
      JSON.stringify(validation.error.issues, null, 2)
    );
    throw new AIServiceError(
      `Gemini returned a plan that did not pass validation: ${validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`
    );
  }

  const plan = validation.data as EventPlan;
  return { plan, modelUsed: DEFAULT_GEMINI_MODEL };
}

/**
 * Evaluates natural-language constraint updates against the current plan to generate actionable replanning proposals.
 * @param currentPlan The active event plan prior to modification.
 * @param requestedChange Natural language description of requested modifications (e.g., budget cuts, date changes).
 * @returns Array of structured replanning proposals with before/after diffs and impact scores.
 */
export async function executeReplanning(
  userQuery: string,
  currentPlan: EventPlan
): Promise<ReplanningResult> {
  const summary = buildCompactReplanningSummary(currentPlan, userQuery);
  const parsed = await generateJson(`${REPLANNING_SYSTEM_PROMPT}

Current event summary: ${JSON.stringify(summary)}
Requested change: ${JSON.stringify(userQuery)}

Identify the requested change and return only { "explanation": "a concise explanation of the request and its relevant planning trade-offs" }.`);

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as { explanation?: unknown }).explanation !== "string"
  ) {
    throw new AIServiceError("Gemini returned an invalid replanning analysis. Please try again.");
  }

  const intent = parseConstraintIntent(userQuery, currentPlan);
  return {
    proposals: generateReplanningProposals(currentPlan, intent),
    explanation: (parsed as { explanation: string }).explanation,
  };
}
