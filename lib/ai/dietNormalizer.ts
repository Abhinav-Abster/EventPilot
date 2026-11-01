/**
 * Dietary preference normalization utilities mapping colloquial terms to supported categories.
 */
import { DietaryPreference } from "../types/event";
import { VALID_DIETS, ValidDiet } from "../config/constants";

export { VALID_DIETS, type ValidDiet };

interface DietRule {
  target: DietaryPreference;
  match: (clean: string) => boolean;
}

const DIET_RULES: readonly DietRule[] = [
  // 1. Vegan must be evaluated before generic vegetarian
  {
    target: "vegan",
    match: (c) => c.includes("vegan"),
  },
  // 2. Non-vegetarian / meat must be evaluated before generic vegetarian
  {
    target: "non-vegetarian",
    match: (c) =>
      c.includes("non-veg") ||
      c.includes("non veg") ||
      c.includes("non-vegetarian") ||
      c.includes("non vegetarian") ||
      c.includes("meat"),
  },
  // 3. Generic vegetarian rule
  {
    target: "vegetarian",
    match: (c) => c.includes("veg") || c.includes("vegetarian"),
  },
  // 4. Jain
  {
    target: "jain",
    match: (c) => c.includes("jain"),
  },
  // 5. Halal
  {
    target: "halal",
    match: (c) => c.includes("halal"),
  },
  // 6. Gluten-free
  {
    target: "gluten-free",
    match: (c) => c.includes("gluten"),
  },
  // 7. Nut allergy
  {
    target: "nut-allergy",
    match: (c) => c.includes("nut"),
  },
];

/**
 * Normalizes user/LLM dietary inputs into canonical DietaryPreference values.
 * Evaluates rules in priority order (vegan & non-veg before generic veg)
 * and strips duplicates and invalid types.
 */
export function normalizeDiets(raw: unknown): DietaryPreference[] {
  if (!raw) return [];

  const items = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
  const results: DietaryPreference[] = [];

  for (const item of items) {
    if (typeof item !== "string") continue;
    const clean = item.toLowerCase().trim();
    if (!clean) continue;

    for (const rule of DIET_RULES) {
      if (rule.match(clean)) {
        if (!results.includes(rule.target)) {
          results.push(rule.target);
        }
        break;
      }
    }
  }

  return results;
}
