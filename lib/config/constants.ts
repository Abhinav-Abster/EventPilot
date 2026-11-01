/**
 * Application-wide configuration defaults, reference constants, and fallback parameters.
 */
import { DietaryPreference } from "../types/event";

/**
 * Demo default city used as fallback when location is omitted in user intake.
 * Retained for backward compatibility with pre-configured reference events.
 */
export const DEFAULT_CITY = "Pune";

/**
 * Supported dietary preference tags recognized across EventPilot schemas and normalizers.
 */
export const VALID_DIETS = [
  "vegetarian",
  "non-vegetarian",
  "vegan",
  "jain",
  "halal",
  "gluten-free",
  "nut-allergy",
] as const;

export type ValidDiet = (typeof VALID_DIETS)[number];

/**
 * Demo default dietary preferences used when unspecified during profile creation.
 */
export const DEFAULT_DIETARY_PREFERENCES: readonly DietaryPreference[] = ["vegetarian"] as const;
