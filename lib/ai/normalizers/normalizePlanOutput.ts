/**
 * Assembles composite event plans from parsed AI payloads with schema validation and default fallbacks.
 */
import { EventProfile } from "../../types/event";
import { AIServiceError } from "../transport";
import { asRecord, asArray } from "../parsingHelpers";
import { normalizeProfile } from "./normalizeProfile";
import { normalizeBudgetItems } from "./normalizeBudgetItems";
import { normalizeTasks } from "./normalizeTasks";
import { normalizeVendors } from "./normalizeVendors";
import { normalizeIdeas } from "./normalizeIdeas";

/**
 * Combines independently normalized AI sections into a validated EventPlan conforming to Zod schema.
 * @param raw Untrusted JSON object parsed from AI response text.
 * @param fallbackProfile Base profile used when AI omitted mandatory fields.
 * @returns Fully formed, validated EventPlan.
 */
export function normalizePlanOutput(output: unknown, profile: Partial<EventProfile>) {
  const root = asRecord(output);
  const generated =
    asRecord(root?.plan) ?? asRecord(root?.eventPlan) ?? asRecord(root?.data) ?? root;
  if (!generated) {
    throw new AIServiceError("Gemini returned an invalid plan format. Please try again.");
  }

  const normalizedProfile = normalizeProfile(profile);
  const rawBudgetItems = asArray(generated.budgetItems, "budget items");
  const budgetItems = normalizeBudgetItems(rawBudgetItems, normalizedProfile.totalBudgetMinor);

  const rawTasks = asArray(generated.tasks, "tasks");
  const tasks = normalizeTasks(rawTasks, normalizedProfile.date);

  const rawVendors = asArray(generated.vendors, "vendors");
  const vendors = normalizeVendors(rawVendors);

  const rawIdeas = asArray(generated.ideas, "ideas");
  const ideas = normalizeIdeas(rawIdeas);

  return {
    profile: normalizedProfile,
    normalizedProfile,
    budgetItems,
    tasks,
    vendors,
    ideas,
  };
}
